import uvicorn
import requests
from openai import OpenAI
import re
from google import genai
from google.genai import types
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi import WebSocket,WebSocketDisconnect,WebSocketException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from pathlib import Path
import shutil
import json
import asyncio
import re
import yaml
from typing import Dict, List, Any, Tuple, Optional
from google.adk.agents.sequential_agent import SequentialAgent
from google.adk.agents.parallel_agent import ParallelAgent
from google.adk.agents.llm_agent import LlmAgent
from google.genai import types
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService, Session 
from google.adk.memory import InMemoryMemoryService
from google.adk.runners import Runner
from google.adk.tools.base_toolset import BaseToolset
from google.adk.tools import FunctionTool
from contextlib import asynccontextmanager
from prompts import all_agents
from mcp_build import check_link, check_a2a_res, build_toolset
from read_config import read_config
from tool_mapping import tool_mapping
from collections import defaultdict
from python_a2a import A2AClient, Message, TextContent, MessageRole
import websockets
from phoenix.otel import register
# Import OpenTelemetry components for span processing and tracing
from opentelemetry.sdk.trace import SpanProcessor, ReadableSpan, Span
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor,SimpleSpanProcessor
from opentelemetry import trace
from opentelemetry.context import Context
import pandas as pd
from google.cloud import spanner
import ssl



load_dotenv() 



########### ADK AGENTIC WORKFLOW CREATION ##############
# tracer_provider = register(
#   project_name="google_japac",
#   endpoint=os.getenv('TRACES_ENDPOINT'),
#   auto_instrument=True
# )


# Configuration constants
APP_NAME = "code_pipeline_app"
USER_ID = "dev_user_01"
SESSION_ID = "pipeline_session_01"
GEMINI_MODEL = "gemini-2.5-flash"

# Store MCP toolsets for proper cleanup
mcp_toolsets = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifespan of the FastAPI app"""
    yield
    # Cleanup MCP toolsets on shutdown
    for toolset in mcp_toolsets:
        try:
            if hasattr(toolset, 'close'):
                await toolset.close()
        except Exception as e:
            print(f"Error closing toolset: {e}")

# Initialize FastAPI app with lifespan management
app = FastAPI(title='Google Hackathon Agent API', 
              description='Google Hackathon Usecase Backend APIs',
              version="1.0.0",
              lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],              # Allows specific origins
    allow_credentials=True,             # Allows cookies and authorization headers
    allow_methods=["*"],                # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],                # Allows all headers

)

# Initialize session and memory services
session_service = InMemorySessionService()
memory_service = InMemoryMemoryService()


async def create_mcp_toolset_safely(url: str):
    """
    Safely create MCP toolset with proper async handling and context management
    """
    try:
        print(f"Attempting to create MCP toolset for URL: {url}")
        
        # Use asyncio.shield to protect against cancellation
        built_toolset = await asyncio.shield(build_toolset(url=url, transport="mcp"))
        
        if built_toolset:
            print(f"Successfully created MCP toolset for URL: {url}")
            # Store for cleanup
            mcp_toolsets.append(built_toolset)
            return built_toolset
        else:
            print(f"Failed to create MCP toolset for URL: {url}")
            return None
            
    except asyncio.CancelledError:
        print(f"MCP toolset creation cancelled for URL: {url}")
        return None
    except Exception as e:
        print(f"Error creating MCP toolset for URL {url}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {"message": "Google Hackathon Agent API is running."}



@app.get("/create_response/", tags=['GoogleADKAgents'])
async def create_response(query: str, uuid: str):
    """
    Main endpoint to create agents and get response
    """
    USER_ID = uuid 
    SESSION_ID = f"session_{uuid}_{APP_NAME}"

    # Assuming necessary imports like 'session_service', 'memory_service', 
    # 'Runner', 'types', 'APP_NAME', 'USER_ID', 'SESSION_ID' are defined elsewhere

    async def call_agent(query: str, root_agent: Any) -> Dict[str, Any]:
        """
        Helper function to call the agent with a query and return a unified list 
        of sequential events (Agent or Tool).
        """
        
        # Placeholder for the final structured data
        events_trace: List[str, Any] = []
        # Tracks the input for the next Agent step
        current_agent_input: str = query
        final_response: str = ""
        data: str = ""

        try:
            # --- Session Setup (Kept from original) ---
            session = await session_service.get_session(
                app_name=APP_NAME, 
                user_id=USER_ID, 
                session_id=SESSION_ID
            )
            if not session:
                await session_service.create_session(
                    app_name=APP_NAME, 
                    user_id=USER_ID, 
                    session_id=SESSION_ID
                )

            # Create runner instance
            runner = Runner(
                agent=root_agent, 
                app_name=APP_NAME, 
                session_service=session_service, 
                memory_service=memory_service
            )

            # Create content from query
            content = types.Content(role='user', parts=[types.Part(text=query)])
            
            # --- Agent Run and Event Processing ---
            async for event in runner.run_async(
                user_id=USER_ID, 
                session_id=SESSION_ID, 
                new_message=content
            ):
                
                agent_name = ""
                agent_output_text = ""
                is_agent_step = False # Flag to check if we log an agent step

                # 1. Determine Agent Name/Step
                if event.actions and event.actions.state_delta:
                    # Assuming the first key in state_delta is the agent that just ran/started
                    agent_name = list(event.actions.state_delta.keys())[0]
                    is_agent_step = True
                
                # 2. Capture Agent Output (Text)
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            agent_output_text += part.text
                            is_agent_step = True # Also log if it's just a text output

                # 3. Log the Agent Step
                if is_agent_step:
                    # Only log if there's significant data or we're at the start
                    if agent_name or agent_output_text or (events_trace == []):
                        # Compact structured format
                        agent_name_clean = agent_name if agent_name else "UnnamedAgent"
                        # Truncate long outputs to avoid token bloat
                        output_preview = agent_output_text[:500] + "..." if len(agent_output_text) > 500 else agent_output_text
                        
                        data = f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🤖 AGENT: {agent_name_clean}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOutput: {output_preview}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                        events_trace.append(data)
                        try:
                            # ssl_context = ssl._create_unverified_context()
                            # async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"70", ssl=ssl_context) as websocket:
                            async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"70") as websocket:
                                    # Send a message with clear structure
                                    message = {
                                        "uid": uuid,
                                        "msg": "agent_step",
                                        "agent_name": agent_name_clean,
                                        "output": output_preview,
                                        "data": data
                                    }
                                    await websocket.send(json.dumps(message))
                                    await asyncio.sleep(0.2)
                                    await websocket.close()
                        except Exception as e:
                            print("Error in websocket :",e)

                        # Update current_agent_input for the *next* step (tool call or next agent)
                        current_agent_input = agent_output_text if agent_output_text else f"Agent {agent_name} finished."

                # 4. Capture Tool Calls (Tool Input)
                func_calls = event.get_function_calls()
                if func_calls:
                    for call in func_calls:
                        # Convert JSON input to readable format
                        try:
                            if call.args:
                                input_lines = []
                                for key, value in call.args.items():
                                    if isinstance(value, str):
                                        if len(value) > 100:
                                            input_lines.append(f"  - {key}: {value[:100]}...")
                                        else:
                                            input_lines.append(f"  - {key}: {value}")
                                    elif isinstance(value, (int, float, bool)):
                                        input_lines.append(f"  - {key}: {value}")
                                    elif isinstance(value, (list, dict)):
                                        input_lines.append(f"  - {key}: {type(value).__name__} with {len(value)} items")
                                    else:
                                        input_lines.append(f"  - {key}: {str(value)[:50]}")
                                
                                args_readable = "Parameters:\n" + "\n".join(input_lines)
                            else:
                                args_readable = "No parameters"
                        except Exception:
                            # Fallback to JSON if parsing fails
                            args_str = json.dumps(call.args)
                            args_readable = args_str[:300] + "..." if len(args_str) > 300 else args_str
                        
                        data = f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔧 TOOL CALL: {call.name}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n{args_readable}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                        events_trace.append(data)
                        try:
                            # ssl_context = ssl._create_unverified_context()
                            # async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"71", ssl=ssl_context) as websocket:
                            async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"71") as websocket:
                                    # Send a message with clear structure
                                    message = {
                                        "uid": uuid,
                                        "msg": "tool_call",
                                        "tool_name": call.name,
                                        "input": args_readable,
                                        "data": data
                                    }
                                    await websocket.send(json.dumps(message))
                                    await asyncio.sleep(0.2)
                                    await websocket.close()
                        except Exception as e:
                            print("Error in websocket :",e)

                        # Update input to reflect the tool call for the *next* step (tool result)
                        current_agent_input = f"Called tool '{call.name}' with input: {json.dumps(call.args)}"

                # 5. Capture Tool Responses (Tool Output)
                func_res = event.get_function_responses()
                if func_res:
                    for res in func_res:
                        tool_output = ""
                        tool_output_summary = ""
                        storage_value = None
                        
                        # --- SAFELY HANDLE DIFFERENT RESPONSE TYPES ---
                        if isinstance(res.response, dict):
                            # Response is a dictionary (e.g., complex JSON data)
                            # Create a natural language summary instead of showing JSON
                            try:
                                summary_lines = []
                                
                                def summarize_value(key, value, depth=0):
                                    """Create human-readable summary of a value"""
                                    indent = "  " * depth
                                    if value is None:
                                        return f"{indent}- {key}: Not provided"
                                    elif isinstance(value, bool):
                                        return f"{indent}- {key}: {'Yes' if value else 'No'}"
                                    elif isinstance(value, (int, float)):
                                        return f"{indent}- {key}: {value}"
                                    elif isinstance(value, str):
                                        if len(value) > 100:
                                            return f"{indent}- {key}: {value[:100]}..."
                                        return f"{indent}- {key}: {value}"
                                    elif isinstance(value, list):
                                        if not value:
                                            return f"{indent}- {key}: Empty list"
                                        elif len(value) <= 3:
                                            # Show small lists in full
                                            items = ", ".join(str(v)[:30] for v in value)
                                            return f"{indent}- {key}: {items}"
                                        else:
                                            # Summarize large lists
                                            first_items = ", ".join(str(v)[:30] for v in value[:2])
                                            return f"{indent}- {key}: {first_items}, ... ({len(value)} total items)"
                                    elif isinstance(value, dict):
                                        if not value:
                                            return f"{indent}- {key}: Empty"
                                        # Recursively summarize nested dict (limited depth)
                                        if depth < 2:
                                            nested = []
                                            for k, v in list(value.items())[:3]:
                                                nested.append(summarize_value(k, v, depth + 1))
                                            if len(value) > 3:
                                                nested.append(f"{indent}  ... and {len(value) - 3} more fields")
                                            return f"{indent}- {key}:\n" + "\n".join(nested)
                                        else:
                                            return f"{indent}- {key}: [Contains {len(value)} fields]"
                                    else:
                                        return f"{indent}- {key}: {str(value)[:50]}"
                                
                                # Summarize top-level keys
                                for key, value in list(res.response.items())[:8]:  # Show first 8 fields
                                    summary_lines.append(summarize_value(key, value))
                                
                                if len(res.response) > 8:
                                    summary_lines.append(f"... and {len(res.response) - 8} more fields")
                                
                                tool_output_summary = "Returned data:\n" + "\n".join(summary_lines)
                                tool_output = json.dumps(res.response, indent=2)  # Keep for processing
                                storage_value = res.response  # Store dict
                            except (TypeError, AttributeError) as e:
                                tool_output = str(res.response)
                                tool_output_summary = f"Response summary: {tool_output[:300]}..."
                                storage_value = str(res.response)
                        elif res.response and hasattr(res.response, 'text') and res.response.text:
                            # Response is an object with a .text attribute (e.g., simple text)
                            tool_output = res.response.text
                            tool_output_summary = tool_output[:400] + "..." if len(tool_output) > 400 else tool_output
                            storage_value = res.response.text  # Store text
                        else:
                            # Fallback for None or other unexpected types
                            tool_output = str(res.response)
                            tool_output_summary = tool_output[:300] if tool_output else "No output"
                            storage_value = str(res.response)
                        
                        # ✅ AUTO-STORE TOOL OUTPUT IN SESSION STATE
                        try:
                            session = await session_service.get_session(
                                app_name=APP_NAME,
                                user_id=USER_ID,
                                session_id=SESSION_ID
                            )
                            if session and storage_value is not None:
                                session.state[res.name] = storage_value
                                print(f"📦 Stored tool output '{res.name}' in session.state (type: {type(storage_value).__name__}, size: {len(str(storage_value))} chars)")
                        except Exception as store_error:
                            print(f"⚠️ Failed to store '{res.name}' in session: {store_error}")
                        # ----------------------------------------------
                        
                        # Use summary instead of raw output for trace
                        data = f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ TOOL RESULT: {res.name}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n{tool_output_summary}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                        events_trace.append(data)
                        try:
                            # ssl_context = ssl._create_unverified_context()
                            # async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"72", ssl=ssl_context) as websocket:
                            async with websockets.connect(os.getenv("WEBSOCKET_URI")+uuid+"72") as websocket:
                                    # Send a message with clear structure
                                    message = {
                                        "uid": uuid,
                                        "msg": "tool_result",
                                        "tool_name": res.name,
                                        "output": tool_output_summary,
                                        "data": data
                                    }
                                    await websocket.send(json.dumps(message))
                                    await asyncio.sleep(0.2)
                                    await websocket.close()
                        except Exception as e:
                            print("Error in websocket :",e)
                        # Update input to reflect the tool result for the *next* step (Agent processing)
                        current_agent_input = f"Tool '{res.name}' returned: {tool_output}"

                # 6. Final Response Capture (Kept from original)
                if event.is_final_response() and agent_output_text:
                    final_response += agent_output_text
                    
            # Add session to memory (Kept from original)
            session2 = await session_service.get_session(
                app_name=APP_NAME, 
                user_id=USER_ID, 
                session_id=SESSION_ID
            )
            if session2:
                await memory_service.add_session_to_memory(session2)

            result = {"response": final_response, "events_trace": events_trace}
 
            # --- Summarize the final_response using Gemini LLM ---
            try:
                if final_response.strip() or events_trace:
                    summarizer_agent = LlmAgent(
                        name="FinalResponseSummarizer",
                        model=GEMINI_MODEL,
                        instruction="""
                        Generate a consolidated response using the outputs from all agents and tools in the workflow.
                        For each agent, present the information in markdown using EXACTLY this structure:
                        
                        ## Agent Name
                        **Purpose:** Brief description of what this agent does
                        
                        **Tools Used:**
                        - tool_name_1
                        - tool_name_2
                        - tool_name_3
                        
                        **Process:**
                        
                        1. **Tool name: exact_tool_name_1**
                           - **Tool input/parameters:**
                             - parameter_1: value
                             - parameter_2: value
                           - **Tool output/response:** Detailed description of what the tool returned in natural language
                        
                        2. **Tool name: exact_tool_name_2**
                           - **Tool input/parameters:**
                             - parameter_1: value
                             - parameter_2: value
                           - **Tool output/response:** Detailed description of what the tool returned in natural language
                        
                        **Agent Response:** The agent's final output, decisions, and outcomes based on all tool results
                        
                        Rules to follow:
                        - Include every agent that participated in the workflow.
                        - Preserve exact agent names - DO NOT modify, abbreviate, or change them in any way.
                        - Preserve exact tool names - DO NOT modify or abbreviate them.
                        - Tool name must be fully bold including the tool name itself: **Tool name: tool_name**
                        - Preserve exact tool names - DO NOT modify or abbreviate them.
                        - Use the agent names exactly as they appear in the trace data (e.g., Patient_Intake_Agent, Clinical_Data_Orchestrator_Agent).
                        - "Tools Used" section: Simple bullet list of tool names only, nothing else
                        - "Process" section: Must be OUTSIDE and AFTER "Tools Used" section
                        - Each tool in Process must be numbered (1., 2., 3., etc.)
                        - Tool name must be in bold: **Tool name:** tool_name
                        - Tool input and Tool output must be indented one level under the tool name
                        - Tool input/parameters and Tool output/response must be in bold
                        - "Agent Response" must be OUTSIDE and AFTER the "Process" section
                        - Include all tool inputs and outputs in detail - do not omit data
                        - Provide a detailed narrative of each agent's response, decisions made, validations performed, and outcomes
                        - Use markdown headings (##, ###) and bullet points for clarity
                        - Do not use code blocks, inline code formatting, highlights, or emojis
                        - Do not summarize excessively or produce brief responses - be thorough and detailed
                        - Ensure logical flow across agents and clearly mention handoffs where applicable
                        - The output must be standalone and ready for stakeholder review
                        - CRITICAL: Never output JSON format. Always use natural language in markdown format
                        - Write in complete sentences and paragraphs, not JSON objects
                        - Convert any JSON-like structures into readable narrative text with bullet points
                        - Tool outputs should be described in plain English, not shown as raw JSON
                        
                        Output the final response entirely in markdown format with natural language only.
                        """,
                        description="Summarizes the complete workflow including all agent and tool interactions.",
                        output_key="FinalResponseSummarizer"
                    )
                    # Combine both final_response and detailed events_trace for comprehensive summary
                    # Create a compact trace summary
                    events_summary = []
                    for i, trace in enumerate(events_trace):
                        # Further compress if trace list is very long
                        if len(events_trace) > 20 and i % 2 == 1:  # Skip every other trace if too many
                            continue
                        events_summary.append(trace)
                    
                    events_detail = "\n".join(events_summary) if events_summary else "No trace available."
                    
                    summary_prompt = f"""Generate a comprehensive workflow summary in natural language markdown format.

Agent Outputs:
{final_response[:3000]}...

Workflow Trace:
{events_detail}

CRITICAL RULES:
1. Use exact agent names as they appear in the trace (e.g., [AGENT] Patient_Intake_Agent)
2. Do NOT change, abbreviate, or modify agent names
3. Use exact tool names
4. Show all agents, tools, inputs/outputs, and decisions
5. NEVER output JSON format - use natural language only
6. Write in complete sentences and narrative paragraphs
7. Convert any structured data into readable prose with bullet points
8. Describe tool outputs in plain English, not as JSON objects"""
                    summary_content = types.Content(role='user', parts=[types.Part(text=summary_prompt)])
                    summarizer_runner = Runner(
                        agent=summarizer_agent,
                        app_name=APP_NAME+"summarizer",
                        session_service=session_service,
                        memory_service=memory_service
                    )
                    # Ensure summarizer session exists
                    summary_user = USER_ID+"summarizer"
                    summary_session = SESSION_ID+"_finalsummary"
                    summary_session_obj = await session_service.get_session(
                        app_name=APP_NAME+"summarizer",
                        user_id=summary_user,
                        session_id=summary_session
                    )
                    if not summary_session_obj:
                        await session_service.create_session(
                            app_name=APP_NAME+"summarizer",
                            user_id=summary_user,
                            session_id=summary_session
                        )
                    summary_response = ""
                    async for event in summarizer_runner.run_async(
                        user_id=summary_user,
                        session_id=summary_session,
                        new_message=summary_content
                    ):
                        if event.is_final_response():
                            if event.content and event.content.parts:
                                for part in event.content.parts:
                                    if part.text:
                                        summary_response += part.text
                    result["final_response_summary"] = summary_response
            except Exception as e:
                result["final_response_summary_error"] = str(e)
            return result

            # Return the final response text and the list of structured event data
            # return {
            #     "response": final_response, 
            #     "events_trace": events_trace
            # }

        except Exception as e:
            print("Error during agent call: ", str(e))
            import traceback
            traceback.print_exc()
            raise e
        finally:
            # Clean up session (Kept from original)
            try:
                await session_service.delete_session(
                    app_name=APP_NAME, 
                    user_id=USER_ID, 
                    session_id=SESSION_ID
                )
            except Exception as cleanup_error:
                print(f"Error during cleanup: {cleanup_error}")
    
    try:
        # Create the root agent
        root_agent = SequentialAgent(
            name="Supervisor",
            description="Use to orchestrate sub-agents to complete complex tasks.",
            sub_agents=[],
        )

        # root_agent = LlmAgent(
        #     name="Supervisor",
        #     model=GEMINI_MODEL,
        #     instruction="""
        #     You are the Supervisor agent. Your role is to orchestrate sub-agents to complete complex tasks. Utilize all the agents that you have created to achieve the user's goal.
        #     Do not answer directly. Instead, delegate tasks to appropriate sub-agents and compile their responses.""",
        #     description="Agent responsible for overseeing sub-agent interactions.",
        #     output_key="Supervisor_Agent"
        # )

        # Create communicator agent
        comm_agent = LlmAgent(
            name="Communicator",
            model=GEMINI_MODEL,
            instruction="""
            You are the Communicator agent. Your role is to interact with the user, 
            understand their requests, and summarize the sub agent responses and 
            send the result to the user.
            """,
            description="Agent responsible for user communication and delivering final results.",
            output_key="Communicator_Agent"
        )
        
        # Get tools mapping and configuration
        try:
            tools_mapping_dict = tool_mapping(uuid)
        except Exception as e:
            print(f"Error getting tool mapping: {e}")
            tools_mapping_dict = {}
            
        post = all_agents.AGENT_POSTFIX
        config = read_config(config_uuid=uuid)
        
        # Create agents from configuration
        for agent in config.get("agents", []):
            agent_name = agent.get('name')
            agent_description = agent.get('agent_description')
            instructions = agent.get('instructions', '') + post
            
            # Initialize tools list for this agent
            agent_tools = []
            # Track MCP toolsets to avoid duplicate tool name collisions
            added_mcp_urls = set()
            mcp_toolset_added = False
            
            # Process tools for this agent
            for tool in agent.get("tools", []):
                tool_info = tool.get("tool_name")
                tool_config = tool.get("config", {})
                tool_type = tool.get("type")
                url = tool_config.get("url")
                desc = tool_config.get("tool_description")

                print(f"Processing tool: {tool_info}, type: {tool_type}")

                try:
                    ################################################################
                    if tool_type == "a2a":
                        print(f"Creating A2A tool for URL: {url}")
                        
                        # Create A2A tool function with closure
                        def create_a2a_tool(agent_url, tool_name, tool_description):
                            def a2a_tool(query: str) -> str:
                                """ 
                                Tool to interact with an A2A agent at the given URL.
                                Args:
                                    query (str): The query to send to the A2A agent.
                                Returns:
                                    str: The response from the A2A agent.
                                """
                                try:
                                    print(f"[A2A Tool {tool_name}] Calling A2A agent at {agent_url} with query: {query[:100]}...")
                                    client = A2AClient(agent_url)
                                    res = client.ask(query)
                                    print(f"[A2A Tool {tool_name}] Received response: {str(res)[:200]}...")
                                    return str(res)
                                except Exception as e:
                                    print(f"[A2A Tool {tool_name}] Error connecting to A2A Client: {e}")
                                    return f"Error: {str(e)}"
                            
                            # Set proper function metadata for ADK
                            a2a_tool.__name__ = tool_name
                            a2a_tool.__doc__ = tool_description or f"Tool to interact with A2A agent for {tool_name}"
                            return a2a_tool
                        
                        # Create the function and wrap it in FunctionTool
                        a2a_func = create_a2a_tool(url, tool_info, desc)
                        a2a_tool_wrapped = FunctionTool(a2a_func)
                        agent_tools.append(a2a_tool_wrapped)
                        print(f"Successfully added A2A tool: {tool_info}")

                    ################################################################

                    # if tool_type == "a2a":
                    #     print(f"Creating A2A tool for URL: {url}")
                        
                    #     # Create A2A tool function with closure
                    #     def create_a2a_tool(agent_url):
                    #         def a2a_tool(query: str) -> str:
                    #             """ 
                    #             Tool to interact with an A2A agent at the given URL.
                    #             Args:
                    #                 query (str): The query to send to the A2A agent.
                    #             Returns:
                    #                 str: The response from the A2A agent.
                    #             """
                    #             try:
                    #                 client = A2AClient(agent_url)
                    #                 res = client.ask(query)
                    #                 return str(res)
                    #             except Exception as e:
                    #                 print(f"Error connecting to A2A Client: {e}")
                    #                 return f"Error: {str(e)}"
                    #         return a2a_tool
                        
                    #     agent_tools.append(create_a2a_tool(url))

                    elif tool_type == "mcp":
                        # Guard: allow only one MCP toolset per agent to prevent duplicate function names across servers
                        if mcp_toolset_added:
                            print(f"Skipping additional MCP toolset for agent '{agent_name}' (URL: {url}) to avoid duplicate function names.")
                            continue

                        if url in added_mcp_urls:
                            print(f"Duplicate MCP URL detected for agent '{agent_name}': {url}. Skipping.")
                            continue

                        print(f"Creating MCP tool for URL: {url}")
                        # Use asyncio.wait_for to add timeout
                        try:
                            built_toolset = await asyncio.wait_for(
                                create_mcp_toolset_safely(url), 
                                timeout=30.0  # 30 second timeout
                            )
                            if built_toolset:
                                agent_tools.append(built_toolset)
                                added_mcp_urls.add(url)
                                mcp_toolset_added = True
                                print(f"Successfully added MCP toolset to agent_tools")
                            else:
                                print(f"Failed to add MCP toolset - toolset is None")
                        except asyncio.TimeoutError:
                            print(f"Timeout creating MCP toolset for URL: {url}")
                        except Exception as mcp_error:
                            print(f"Error creating MCP toolset: {mcp_error}")
                    
                    else:
                        # Handle regular tools from mapping
                        if tools_mapping_dict and tool_info in tools_mapping_dict:
                            mapped_tool = tools_mapping_dict.get(tool_info)
                            print(f"Tool: {tool_info}, Type: {type(mapped_tool)}")
                            
                            if mapped_tool is not None and callable(mapped_tool):
                                agent_tools.append(mapped_tool)
                                print(f"Added mapped tool: {tool_info}")
                            else:
                                print(f"Warning: Tool '{tool_info}' is not callable or is None")
                        else:
                            print(f"Warning: Tool '{tool_info}' not found in mapping or no mapping available")
                
                except Exception as tool_error:
                    print(f"Error processing tool {tool_info}: {tool_error}")
                    continue

            print(f"Final tools for agent {agent_name}: {len(agent_tools)} tools")
            print(f"Tool types: {[type(tool).__name__ for tool in agent_tools]}")
            
            # Create new LLM agent
            try:
                new_agent = LlmAgent(
                    name=agent_name,
                    model=GEMINI_MODEL,
                    instruction=instructions,
                    description=agent_description,
                    tools=agent_tools,
                    output_key=agent_name
                )
                
                print(f"Agent {agent_name} created and added as a sub-agent.")
                
                # Add to root agent
                root_agent.sub_agents.append(new_agent)
            except Exception as agent_error:
                print(f"Error creating agent {agent_name}: {agent_error}")
                continue
        
        # Add communicator agent
        # root_agent.sub_agents.append(comm_agent)
        
        print(f"Total Sub-agents in Root Agent: {len(root_agent.sub_agents)}")
        for sub in root_agent.sub_agents:
            print(f"Sub-agent: {sub.name}")

        # Call the agent with the query
        # return await call_agent(query=query, root_agent=root_agent)
        
        return await call_agent(query=query, root_agent=root_agent)

        # final_response_summary = "## Patient Clinical Summary Report\n### Patient Summary - P001 (Arjun Mehra)\n**Demographics & Admission**\n- Patient ID / MRN: P001 / MRN-2024-001\n- Age / Gender: 37 years / Male\n- Address: Mumbai, Maharashtra\n- Admission Type: Inpatient (IPD)\n- Ward/Room/Bed: Cardiology / 203 / B2\n- Primary Physician: Doctor D001\n- Admission Status: Admitted - Under Observation (16 June 2024)\n\n**Medical Condition**\n- Primary Complaint: Severe chest pain & fatigue\n- Cardiac Findings: High BP (150/95), HR (108), ST elevation, Positive Troponin, Mild LV dysfunction, Pulmonary congestion, High LDL & triglycerides\n- Risk Factors: Family history, high stress\n- Current Phase: Emergency cardiac management in CCU\n\n**Treatment Overview (16 June 2024)**\n- Aspirin (Anti-platelet) - Active\n- Clopidogrel (Dual antiplatelet) - Active\n- Atorvastatin (Lipid-lowering) - Active\n- Nitroglycerin IV (Chest pain relief) - Active\n- Heparin IV (Anticoagulant) - Active\nNurses report improvement in vitals and pain reduction.\n\n**Upcoming Procedure**\n- Coronary Angiography - Scheduled 17 June 2024 (TRT-006) - To confirm blockage\n\n**Overall Clinical Impression**\nSuspected Acute Coronary Syndrome (ACS); patient under continuous monitoring and stabilization therapies.\n\n**Nursing Staff on Duty**\n- NurseID: N001 - Sneha Patil, Ward: Cardiology, Shift: Day, Experience: 5 years\n- NurseID: N002 - Kavya Menon, Ward: Cardiology, Shift: Night, Experience: 8 years\n\n---\n### System Workflow & Data Provenance\nHere is a summary of the actions taken by the agents:\n- Agent Name: Patient_Intake_Agent\n  - Tool Used: capture_admission_profile\n  - Response:\n    - Retrieved and documented patient admission details including identity, ward allocation, and primary physician.\n\n- Agent Name: Clinical_Data_Orchestrator_Agent\n  - Tool Used: retrieve_past_patient_data\n  - Response:\n    - Retrieved the patient's historical EHR and treatment data.\n\n- Agent Name: Clinical_Data_Orchestrator_Agent\n  - Tool Used: get_doctor_diagnosis\n  - Response:\n    - Extracted the doctor's diagnosis and treatment directives.\n\n- Agent Name: Clinical_Data_Orchestrator_Agent\n  - Tool Used: generate_ontology_based_diagnosis\n  - Response:\n    - Produced an ontology-based structured clinical diagnosis summary.\n\n- Agent Name: Clinical_Reasoning_Agent\n  - Tool Used: store_patient_report\n  - Response:\n    - Successfully stored the processed patient report in the system.\n\n- Agent Name: UnnamedAgent\n  - Tool Used: create_handover_summary\n  - Response:\n    - Generated the patient handover summary for continuity of care.\n\n- Agent Name: UnnamedAgent\n  - Tool Used: deliver_handover_summary\n  - Response:\n    - Delivered the report to the relevant clinical communication channel successfully.\n"
        # return {"final_response_summary": final_response_summary}
	
    
    except Exception as e:
        print(f"Error creating agents: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


if __name__ == '__main__':
    uvicorn.run(
        "main_adk:app",
        host="0.0.0.0",
        port=8081,
    )
