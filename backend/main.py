from contextlib import asynccontextmanager
from vertexai_evaluation import init_vertexai, run_agent_evaluation
import pandas as pd
import uvicorn
import requests
from openai import OpenAI
import re
from pydantic import BaseModel, Field 
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi import WebSocket,WebSocketDisconnect,WebSocketException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import firestore
import os
from dotenv import load_dotenv
from pathlib import Path
import shutil
import json
import asyncio
import yaml
from typing import Dict, List, Any, Tuple, Optional, Literal
from firestore_data import get_document, list_documents
from google import genai
from google.adk.agents.sequential_agent import SequentialAgent
from google.adk.agents.parallel_agent import ParallelAgent
from google.adk.agents.llm_agent import LlmAgent
from google.genai import types
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService, Session 
from google.adk.memory import InMemoryMemoryService
from google.adk.runners import Runner
from google.adk.tools.base_toolset import BaseToolset
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
from google.cloud import spanner
import ssl
from input_data_creation import ALL_SUPPORTED_EXTENSIONS, read_file_content
from utils import _process_uploaded_files

load_dotenv() 

################ FIRESTORE SETUP ####################
db = firestore.AsyncClient(
    project=os.getenv('GCP_PROJECT') or os.getenv('GOOGLE_CLOUD_PROJECT'),
    database=os.getenv('FIRESTORE_DATABASE', '(default)')
)

# Define the collections
patient_collection = db.collection('patients')
physician_collection = db.collection('physicians')
plan_collection = db.collection('plans')
laboratory_collection = db.collection('laboratories')
clinical_documents_collection = db.collection('clinical_documents')
claims_collection = db.collection('claims')
locations_collection = db.collection('locations')
devices_collection = db.collection('devices')
claim_actionables_collection = db.collection('actionable_tasks')
final_reports_collection = db.collection('final_reports')
ontology_graphs_collection = db.collection('ontology_graphs')

########### ADK AGENTIC WORKFLOW CREATION ##############

WEBSOCKET_URI = os.getenv('WEBSOCKET_URI')

# Configuration constants
APP_NAME = "code_pipeline_app"
USER_ID = "dev_user_01"
SESSION_ID = "pipeline_session_01"
GEMINI_MODEL = "gemini-2.5-flash"

# Store MCP toolsets for proper cleanup
mcp_toolsets = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs BEFORE the application starts taking requests
    init_vertexai()
    yield
    # This runs AFTER the application finishes handling requests (Shutdown logic)
    # Cleanup MCP toolsets on shutdown
    for toolset in mcp_toolsets:
        try:
            if hasattr(toolset, 'close'):
                await toolset.close()
        except Exception as e:
            print(f"Error closing toolset: {e}")


app = FastAPI(
    title="APIs for Google JAPAC Hackathon 2026",
    description="This contains Google Hackathon Usecase Backend APIs",
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

# ########### Health check endpoint ##################
@app.get("/")
async def root():
    """Root endpoint to check if API is running"""
    return {"message": "Google Hackathon Agent API is running."}

############ WEBSOCKET ###################
# Manages WebSocket connections
class ConnectionManager:
    def __init__(self):
        # List to store active WebSocket connections
        self.active_connections: List[WebSocket] = []
 
    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection and adds it to the list of active connections."""
        await websocket.accept()
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection from the list of active connections."""
        try:
            print("Disconnect function started")
            self.active_connections.remove(websocket)
            print("Disconnect function ended")
        except ValueError:
            # This occurs if the websocket is not in the list, which can happen in race conditions
            print("Websocket already removed or not found")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Sends a message to a specific WebSocket connection."""
        await websocket.send_text(message)
 
    async def broadcast(self, message: str):
        """Sends a message to all active WebSocket connections."""
        print("Broadcast Loop started")
        for connection in self.active_connections:
            # try:
            print(f"Sending text msg {message}")
            await connection.send_text(message)
            # except RuntimeError as e:
            #     print("e:",e)
            #     print("Runtime Error in broadcasting")
            #     self.disconnect(connection)
            # except Exception as e:
            #     print("e:",e)
            #     print("Exception in broadcasting")
            #     self.disconnect(connection)
        print("Broadcast Loop completed")

    def get_connection_count(self)-> int:
        """Returns the number of active WebSocket connections."""
        return len(self.active_connections)

# Create a single instance of the ConnectionManager to be used by the application
manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws1/{client_id}")
async def websocket_endpoint(websocket: WebSocket,client_id:str):
    """Handles WebSocket connections, receives messages, and broadcasts them."""
    # Accept the new connection
    await manager.connect(websocket)
    print("Active Connections :",manager.get_connection_count())
    try:
        # Loop to wait for messages from the client
        while True:
            data = await websocket.receive_text()
            print(f"Received Data : {data}" )
            # Send an acknowledgment back to the client (currently commented out)
            # await manager.send_personal_message(f"Message received: {data}", websocket)
            # Broadcast the received message to all connected clients
            print("Broadcast starting")
            await manager.broadcast(f"{data}")
            print("Broadcast completed")

    except WebSocketDisconnect:
        # This block is executed when the client disconnects
        print("WebSocketDisconnect function triggered")
        manager.disconnect(websocket)
        print(f"Client {client_id} disconnected")
    
    except RuntimeError as e:
        # This block is executed if a runtime error occurs with the connection
        print("RuntimeError function triggered")
        manager.disconnect(websocket)
        print("E :",e)
        print(f"Runtime error occured so connection removed{websocket} ")

    finally:
        # This block ensures the connection is closed and removed if it still exists
        if websocket in manager.active_connections:
            manager.disconnect(websocket)
            await websocket.close()

################# APIS FOR WORKFLOW ##################
@app.get("/get_claim_information/{claim_id}", tags=["ClaimsIntelWorkflow"])
async def get_claim_information(claim_id: str):
    claim = await get_document(claims_collection, claim_id)

    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    patient = None
    if claim.get("patient_id"):
        patient = await get_document(patient_collection, claim["patient_id"])

    provider = None
    if claim.get("physician_id"):
        provider = await get_document(physician_collection, claim["physician_id"])

    plan = None
    if claim.get("plan_id"):
        plan = await get_document(plan_collection, claim["plan_id"])

    laboratory = None
    if claim.get("laboratory_id"):
        laboratory = await get_document(laboratory_collection, claim["laboratory_id"])

    clinical_documents = []
    if claim.get("clinical_documents"):
        for document_id in claim["clinical_documents"]:
            document = await get_document(clinical_documents_collection, document_id, include_id=False)
            if document:
                clinical_documents.append(document)

    return {
        "claim": claim,
        "patient": patient,
        "provider": provider,
        "plan": plan,
        "laboratory": laboratory,
        "clinical_documents": clinical_documents
    }

@app.get("/get_location_and_device_details/{claim_id}",tags=["ClaimsIntelWorkflow"])
async def get_location_and_device_details(claim_id: str):
    try:
        claim = await get_document(claims_collection, claim_id, include_id=False)
        if not claim:
            raise HTTPException(status_code=404,detail=f"Claim details not found for claim_id: {claim_id}")

        # Extract IDs from claim
        patient_location_id = claim.get("patient_location_id")
        physician_location_id = claim.get("physician_location_id")
        laboratory_location_id = claim.get("laboratory_location_id")
        device_id = claim.get("submission_device_id")

        print(physician_location_id)

        # Fetch locations
        location_ids = [
            location_id
            for location_id in [
                patient_location_id,
                physician_location_id,
                laboratory_location_id
            ]
            if location_id
        ]

        locations = []
        if location_ids:
            for location_id in dict.fromkeys(location_ids):
                location = await get_document(locations_collection, location_id, include_id=False)
                if location is not None:
                    locations.append(location)

        # Fetch devices
        device = None
        if device_id:
            device = await get_document(devices_collection, device_id, include_id=False)

        # Organize locations by type
        location_details = {
            "patient_location": None,
            "physician_location": None,
            "laboratory_location": None
        }

        for location in locations:
            location_type = location.get("location_type")

            if location_type == "patient":
                location_details["patient_location"] = location

            elif location_type == "physician":
                location_details["physician_location"] = location
                print("#######", location)

            elif location_type == "laboratory":
                location_details["laboratory_location"] = location

        # Return combined response
        return {
            "claim_id": claim_id,
            "location_details": location_details,
            "submission_location": claim.get("submission_location"),
            "device_details": device
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}")

@app.get("/get_actionables/{claim_id}",tags=["ClaimsIntelWorkflow"])
async def get_actionables(claim_id: str):
    try:
        # First verify that the claim exists
        claim = await get_document(claims_collection, claim_id)

        if not claim:
            raise HTTPException(status_code=404,detail=f"Claim not found for claim_id: {claim_id}")

        actionables = await list_documents(claim_actionables_collection, "claim_id", claim_id)
        
        return actionables

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}")

class ActionableCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    reasoning: str = Field(..., min_length=1)
    decision: Optional[Literal["pending", "approved", "rejected"]] = None

@app.post("/add_actionable/{claim_id}",tags=["ClaimsIntelWorkflow"])
async def add_actionable(claim_id: str, actionable_list: List[ActionableCreate]):
    try:
        # Verify claim exists
        claim = await get_document(claims_collection, claim_id)

        if not claim:
            raise HTTPException(status_code=404,detail=f"Claim not found for claim_id: {claim_id}")

        if not actionable_list:
            raise HTTPException(status_code=400,detail="Actionable list cannot be empty")

        # Convert Pydantic objects to dictionaries
        actionable_documents = []

        for actionable in actionable_list:
            actionable_dict = actionable.model_dump()

            # Add claim_id to each actionable
            actionable_dict["claim_id"] = claim_id
            # if decision is not present add default value as "pending"
            if "decision" not in actionable_dict:
                actionable_dict["decision"] = "pending"

            actionable_documents.append(actionable_dict)

        # Insert all actionables
        actionable_ids = []
        for offset in range(0, len(actionable_documents), 500):
            batch = db.batch()
            for actionable_document in actionable_documents[offset:offset + 500]:
                reference = claim_actionables_collection.document()
                batch.create(reference, actionable_document)
                actionable_ids.append(reference.id)
            await batch.commit()

        return {
            "message": f"Actionables added successfully for Claim: {claim_id}",
            "count": len(actionable_ids),
            "actionable_ids": actionable_ids
        }

    except HTTPException: raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
@app.put("/update_actionable_decision/{actionable_id}",tags=["ClaimsIntelWorkflow"])
async def update_actionable_decision(actionable_id: str,decision: str):
    try:
        if not actionable_id or '/' in actionable_id or actionable_id in ('.', '..'):
            raise HTTPException(status_code=400,detail="Invalid actionable_id")

        reference = claim_actionables_collection.document(actionable_id)
        if not (await reference.get()).exists:
            raise HTTPException(status_code=404, detail=f"Actionable not found: {actionable_id}" )

        await reference.update({"decision": decision})
        updated_actionable = await get_document(claim_actionables_collection, actionable_id, include_id=False)

        return {
            "message": "Actionable decision updated successfully",
            "actionable": updated_actionable
        }

    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}" )

@app.delete("/delete_actionable/{actionable_id}", tags=["ClaimsIntelWorkflow"])
async def delete_actionable(actionable_id: str):
    try:
        if not actionable_id or '/' in actionable_id or actionable_id in ('.', '..'):
            raise HTTPException(status_code=400, detail="Invalid actionable_id")

        reference = claim_actionables_collection.document(actionable_id)
        if not (await reference.get()).exists:
            raise HTTPException( status_code=404, detail=f"Actionable not found: {actionable_id}" )

        await reference.delete()
        return { "message": "Actionable deleted successfully" }

    except HTTPException:   raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

class StoreFinalReport(BaseModel):
    claim_id:str
    report_details:str

@app.post("/store_final_report/", tags=["ClaimsIntelWorkflow"])
async def store_final_report(data: StoreFinalReport):
    try:
        existing_reports = await list_documents(final_reports_collection, "claim_id", data.claim_id)

        if existing_reports:
            await final_reports_collection.document(existing_reports[0]["id"]).update(
                {"report_details": data.report_details}
            )
        else:
            await final_reports_collection.document(data.claim_id).set(data.model_dump(), merge=True)

        return {"message": "Final report stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

class OntologyGraphRelationships(BaseModel):
    source: str
    target: str

@app.post("/store_ontology_graph/{claim_id}", tags=["ClaimsIntelWorkflow"])
async def store_ontology_graph(claim_id: str, relationships: List[OntologyGraphRelationships]):
    try:
        if not claim_id:
            raise HTTPException(status_code=400, detail="Missing claim_id")

        relationships_data = [rel.model_dump() for rel in relationships]

        await ontology_graphs_collection.document(claim_id).set(
            {"relationships": relationships_data}, merge=True
        )

        return {"message": "Ontology graph stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

################# APIS FOR UI ########################
@app.get('/get_all_patients', tags=['ClaimsIntelUI'])
async def get_all_patients():
    try:
        patient_list = await list_documents(patient_collection)
        if not patient_list: 
            raise HTTPException(status_code=404,detail=f"patient details not found")
        
        return patient_list
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}")

@app.get('/get_patient_data/{patient_id}', tags=['ClaimsIntelUI'])
async def get_patient_data(patient_id:str):
    try:
        patient = await get_document(patient_collection, patient_id, include_id=False)
        if not patient: 
            raise HTTPException(status_code=404,detail=f"patient_id {patient_id} not found")
        
        return patient
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}")

@app.get('/get_all_claims', tags=['ClaimsIntelUI'])
async def get_all_claims():
    try:
        claims = await list_documents(claims_collection, "status", "In-Progress")
        claims_list = []
        patients = {}
        for claim in claims:
            patient_id = claim.get("patient_id")
            if not patient_id:
                continue
            if patient_id not in patients:
                patients[patient_id] = await get_document(patient_collection, patient_id)
            patient = patients[patient_id]
            if patient is None:
                continue
            claim_data = {"claim_id": claim["id"]}
            for field in ("patient_id", "submission_date", "status"):
                if field in claim:
                    claim_data[field] = claim[field]
            if "name" in patient:
                claim_data["patient_name"] = patient["name"]
            claims_list.append(claim_data)
            if len(claims_list) == 1000:
                break

        if not claims_list: 
            raise HTTPException(status_code=404,detail=f"patient details not found")
        
        return claims_list
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Server error: {str(e)}")

@app.get("/get_final_report/{claim_id}", tags=["ClaimsIntelUI"])
async def get_final_report(claim_id: str):
    try:
        final_reports = await list_documents(final_reports_collection, "claim_id", claim_id, include_id=False)
        if not final_reports:
            raise HTTPException(status_code=404, detail=f"Final report not found for claim_id: {claim_id}")
        
        return final_reports[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# get ontology relationships for a specific claim_id
@app.get("/get_ontology_relationships/{claim_id}", tags=["ClaimsIntelUI"])
async def get_ontology_relationships(claim_id: str):
    try:
        ontology_graph = await get_document(ontology_graphs_collection, claim_id, include_id=False)
        if not ontology_graph:
            raise HTTPException(status_code=404, detail=f"Ontology relationships not found for claim_id: {claim_id}")
        
        return ontology_graph
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

############### YAML CREATION ###############
# This converts prompt text to YAML config
@app.post('/multiple_data_to_yaml/{config_uuid}', tags=['YAML Creation'])
def multiple_data_to_yaml(config_uuid:str, multiple_data: str=Form(...)):
    """This tool converts document data (SOP, XAML, etc. ) with agents list to YAML config
    Args:
        multiple_data: The data that would content document data and list of agents
    """
    print("inside tool multiple_data_to_yaml")
    try:
        with open("sample_config.yaml", "r", encoding="utf-8") as file:
            yaml_content = file.read()
      
        print("Input data: ", multiple_data)
        prompt = """
                You are a workflow automation expert tasked with extracting structured task-level agent data from a multiple content description that might contain XAML data, SOP data, NLP prompts, etc., and filling in a predefined YAML template. Your job is to transform these into a properly sequenced and modular **agent-based YAML config**.

                ### Input:

                - **YAML file content (template):**  
                The base YAML structure for inserting agents and tools. Format must be strictly preserved.

                {yaml_content}

                - **Multiple content:**  
                A list of descriptions like XAML workflows, SOP steps, automation tasks, prompts, or pseudocode. These describe a multi-step workflow including activities, systems, and responsibilities.

                {workflow_description}

               """
        
        # Create a ChatPromptTemplate with the given prompt
        messages = prompt.format(workflow_description=multiple_data, yaml_content=yaml_content)

        # For Gemini Reasoning model code
        print('Using Gemini model.')
        client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=messages,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(
            include_thoughts=True
            )
        )
        )

        think_content = ''
        yaml_data = ''

        for part in response.candidates[0].content.parts:
            if not part.text:
                continue
            if part.thought:
                print("Thought summary:")
                print(part.text)
                think_content += part.text
                print()
            else:
                print("Answer:")
                print(part.text)
                yaml_data += part.text
                print()

        yaml_data = yaml_data.replace("```yaml", "").replace("```", "")     

        data, tools = parse_agent_tools_from_yaml(yaml_data)
        knowledge_graph = get_agent_tool_connections(
            data=data,
            tool_defs=tools,
            project_id="tranquil-rite-472707-t4",
            instance_id="demo",
            database_id="demo-database",
            credentials_path="tranquil-rite-472707-t4-feea80e54fbe.json",
            threshold=1
        )

        return {"thought_process": think_content, "yaml": yaml_data, "graph":knowledge_graph}  

    except requests.exceptions.RequestException as errex: 
            print("Exception while fetching device data :",errex)

    return("Error Occured")


@app.post("/uploadconfig/{config_uuid}",
          responses={
              200: {"description": "Successful"},
              500: {"description": "Processing error"}
          },
          tags = ['YAML Creation'])
async def uploadconfig(config_uuid:str, file: UploadFile = File(...)):

    # Validate file extension
    assert file.filename is not None
    if not (file.filename.endswith('.yaml') or file.filename.endswith('.yml')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Only YAML files (.yaml or .yml) are accepted")
    
    try:
        # Read the uploaded file content
        contents = await file.read()
       
        # Create UUID-specific directory
        config_dir = Path(f"./configs/{config_uuid}")
        config_dir.mkdir(parents=True, exist_ok=True)
        filename="config.yaml"
        config_path = os.path.join(config_dir, filename)
       
        # Save the file
        with open(config_path, 'wb') as f:
            f.write(contents)

        return f"File saved at: {config_path}"
       
        # Validate the configuration
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if os.path.exists(config_path):
            shutil.rmtree(os.path.dirname(config_path), ignore_errors=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Error processing config file: {str(e)}")

def parse_agent_tools_from_yaml(yaml_text: str) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    """
    Parses YAML text containing agent and tool definitions and returns them in
    the requested dictionary/list format.
   
    The function extracts agent details and maps tool_name from the YAML
    to a simplified tool name for the tools dictionary.
 
    Args:
        yaml_text: A string containing the YAML configuration.
 
    Returns:
        A tuple containing:
        - agents_list: A list of agent dictionaries (matching the target format).
        - tools_dict: A dictionary of tool_name: tool_description (simplified).
    """
   
    # 1. Load the YAML data
    try:
        data = yaml.safe_load(yaml_text)
    except yaml.YAMLError as e:
        print(f"Error loading YAML: {e}")
        return [], {}
 
    agents_list: List[Dict[str, Any]] = []
    tools_dict: Dict[str, str] = {}
   
    # 2. Extract and process agents and tools
    yaml_agents = data.get('agents', [])
   
    for i, agent_config in enumerate(yaml_agents):
        agent_name = agent_config.get('name')
        # Create a machine-friendly ID from the name
        agent_id = f"agent_{agent_name.lower().replace('_agent', '').replace('_', '').replace(' ', '')}"
       
        agent_tools_names: List[str] = []
       
        # Process tools for the current agent
        for tool_config in agent_config.get('tools', []):
            tool_name = tool_config.get('tool_name')
            tool_description = tool_config.get('config', {}).get('tool_description')
           
            if tool_name:
                agent_tools_names.append(tool_name)
           
            if tool_name and tool_description:
                # Add/Update the tool in the main tools dictionary
                # Using the tool_name from the YAML as the key and a simplified description
                # Note: The provided example tool descriptions are complex (like sentences).
                # For the required format, we take the 'tool_name' as the key and the
                # 'tool_description' from the YAML 'config' section as the value.
                tools_dict[tool_name] = tool_description
       
        # Construct the agent dictionary
        agent_dict = {
            "id": agent_id,
            "name": agent_name,
            "description": agent_config.get('agent_description', ''),
            "tools": agent_tools_names
        }
        agents_list.append(agent_dict)
       
    return agents_list, tools_dict
 
def get_agent_tool_connections(
    data: List[Dict],
    tool_defs: Dict[str, str],
    project_id: str,
    instance_id: str,
    database_id: str,
    credentials_path: str,
    threshold: int = 2
) -> pd.DataFrame:
   
    # Set credentials
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
   
    # Initialize Spanner client
    spanner_client = spanner.Client(project=project_id)
    instance = spanner_client.instance(instance_id)
    database = instance.database(database_id)
   
    # ==========================================
    # STEP 1: Reset Schema
    # ==========================================
    print("--- Resetting Schema ---")
    try:
        op = database.update_ddl(["DROP PROPERTY GRAPH IF EXISTS AgentWorkflowGraph"])
        op.result(timeout=120)
       
        op = database.update_ddl([
            "DROP TABLE IF EXISTS Agent_Tools",
            "DROP TABLE IF EXISTS Tools",
            "DROP TABLE IF EXISTS Agents"
        ])
        op.result(timeout=120)
    except Exception as e:
        print(f"Note: Cleanup skipped (tables might not exist): {e}")
   
    ddl_statements = [
        """CREATE TABLE Agents (
            id STRING(36) NOT NULL,
            name STRING(100),
            description STRING(MAX)
        ) PRIMARY KEY (id)""",
       
        """CREATE TABLE Tools (
            id STRING(36) NOT NULL,
            name STRING(100),
            description STRING(MAX)
        ) PRIMARY KEY (id)""",
       
        """CREATE TABLE Agent_Tools (
            agent_id STRING(36) NOT NULL,
            tool_id STRING(36) NOT NULL,
            CONSTRAINT FK_Agent FOREIGN KEY (agent_id) REFERENCES Agents (id),
            CONSTRAINT FK_Tool FOREIGN KEY (tool_id) REFERENCES Tools (id)
        ) PRIMARY KEY (agent_id, tool_id)""",
       
        """CREATE PROPERTY GRAPH AgentWorkflowGraph
           NODE TABLES (
               Agents LABEL Agent PROPERTIES(id, name, description),
               Tools LABEL Tool PROPERTIES(id, name, description)
           )
           EDGE TABLES (
               Agent_Tools
               SOURCE KEY (agent_id) REFERENCES Agents (id)
               DESTINATION KEY (tool_id) REFERENCES Tools (id)
               LABEL USES
           )"""
    ]
   
    op = database.update_ddl(ddl_statements)
    op.result(timeout=300)
    print("Schema created successfully.")
   
    # ==========================================
    # STEP 2: Insert Data
    # ==========================================
    print("--- Inserting Data ---")
   
    def insert_txn(transaction):
        agent_rows = []
        tool_rows = []
        edge_rows = []
        seen_tools = set()
       
        for agent in data:
            agent_rows.append((agent['id'], agent['name'], agent['description']))
           
            for tool_key in agent['tools']:
                if tool_key in tool_defs:
                    tool_name = tool_key
                   
                    if tool_key not in seen_tools:
                        tool_rows.append((tool_key, tool_name, "Tool description..."))
                        seen_tools.add(tool_key)
                   
                    edge_rows.append((agent['id'], tool_key))
                else:
                    print(f"Warning: Tool '{tool_key}' not found in definitions, skipping.")
       
        transaction.insert(
            table='Agents',
            columns=('id', 'name', 'description'),
            values=agent_rows
        )
       
        transaction.insert(
            table='Tools',
            columns=('id', 'name', 'description'),
            values=tool_rows
        )
       
        transaction.insert(
            table='Agent_Tools',
            columns=('agent_id', 'tool_id'),
            values=edge_rows
        )
   
    database.run_in_transaction(insert_txn)
    print("Data inserted successfully.")
   
    # ==========================================
    # STEP 3: Query Agent-Tool Connections
    # ==========================================
    print(f"\n--- Extracting Agents with >= {threshold} Tools ---")
   
    query = """
        GRAPH AgentWorkflowGraph
        MATCH (a:Agent)-[e:USES]->(t:Tool)
        WHERE a.id IN (
            SELECT agent_id
            FROM Agent_Tools
            GROUP BY agent_id
            HAVING COUNT(*) >= @threshold
        )
        RETURN a.name AS Agent, t.name AS Tool
    """
   
    params = {"threshold": threshold}
    param_types = {"threshold": spanner.param_types.INT64}
   
    with database.snapshot() as snapshot:
        results = snapshot.execute_sql(query, params=params, param_types=param_types)
        rows = list(results)
   
    if not rows:
        print("No agents found above this threshold.")
        return None
   
    print(f"Found {len(rows)} connections matching criteria.")
   
    # Create and return DataFrame
    df = pd.DataFrame(rows, columns=['Agent', 'Connected_Tool'])
    list_of_lists = df[['Agent', 'Connected_Tool']].values.tolist()
    return list_of_lists
 

@app.post("/process-files", tags=["Process Discover"])
async def process_files(files: List[UploadFile] = File(...)):
    req_id = datetime.now().strftime("%H%M%S")

    try:
            if not files:
                raise HTTPException(status_code=400, detail="No files were uploaded.")

            combined_content = "SOURCE INPUT FILES:\n"
            processed_count = 0

            os.makedirs("videos", exist_ok=True)
            for index, file in enumerate(files, start=1):
                filename = file.filename or ""
                combined_content += f"\n--- File {index}: {filename} ---\n"
                response = read_file_content(file.file, file.filename or "")
                combined_content += response
                processed_count += 1

            if processed_count == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"No supported files found. Supported extensions: {', '.join(sorted(ALL_SUPPORTED_EXTENSIONS))}"
                )
            resp = await _process_uploaded_files(
                "Strictly follow the mentioned output format" + combined_content,
                req_id,
            )
            return resp

    except Exception as e:
        return {"error": str(e)}

############### WORKFLOW EVALUATION ###########
class EvaluationData(BaseModel):
    prompt: str
    instruction: str
    agent_trajectory: str
    response: str
    reference: str

@app.post("/evaluate_vertexai", tags=["Agent Evaluation"])
async def evaluate_agent_response(data_entries: List[EvaluationData]):
    """Evaluates agent responses using predefined and custom Vertex AI metrics."""
    print(f"Received {len(data_entries)} data entries for evaluation.")
    data_dicts = [entry.model_dump() for entry in data_entries]
    eval_dataset = pd.DataFrame(data_dicts)

    try:
        metrics_table_json = await run_agent_evaluation(eval_dataset)
        print("Evaluation complete. Returning results.")
        return {"evaluation_results": metrics_table_json}
    except Exception as e:
        print(f"An error occurred during evaluation: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    print("Starting FastAPI application. Access \"/docs\" for API documentation.")
    uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8082,

    )
