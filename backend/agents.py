import inspect
import os
from typing import Dict

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from prompts.all_agents import AUTOMATION_STRATEGY_PROMPT, PROCESS_DISCOVERY_PROMPT


load_dotenv()

APP_NAME = "process"
DEFAULT_USER_ID = "process_api_user"
MODEL_NAME = os.getenv("ADK_MODEL", "gemini-2.5-flash")

ARTIFACT_CONTEXT_INSTRUCTION = """
Use the provided SOURCE INPUT, PROCESS DISCOVERY RESULT, and AUTOMATION STRATEGY RESULT as your full context.
Do not require AnalysisPack, RuleInventoryPack, RuleDocsPack, or UserSpecPack from removed upstream agents.
Preserve the requested output envelope and document format from the base instruction.
"""


process_discovery_agent = Agent(
    name="process_discovery_agent",
    model=MODEL_NAME,
    description="Discovers the end-to-end business process from uploaded process artifacts.",
    instruction=PROCESS_DISCOVERY_PROMPT,
    output_key="process_discovery_result",
)

automation_strategy_agent = Agent(
    name="automation_strategy_agent",
    model=MODEL_NAME,
    description="Recommends deterministic, agentic, and human-in-the-loop execution strategies.",
    instruction=AUTOMATION_STRATEGY_PROMPT,
    output_key="automation_strategy",
)


async def _maybe_await(value):
    if inspect.isawaitable(value):
        return await value
    return value


async def _run_agent(agent: Agent, prompt: str, req_id: str) -> str:
    session_service = InMemorySessionService()
    session_id = f"{req_id}_{agent.name}"
    await _maybe_await(
        session_service.create_session(
            app_name=APP_NAME,
            user_id=DEFAULT_USER_ID,
            session_id=session_id,
        )
    )

    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service,
    )
    content = types.Content(role="user", parts=[types.Part(text=prompt)])
    final_text = ""

    async for event in runner.run_async(
        user_id=DEFAULT_USER_ID,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_text = "".join(part.text or "" for part in event.content.parts).strip()

    return final_text


async def run_process_agents(combined_content: str, req_id: str) -> Dict[str, str]:
    os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_VIDEO_KEY", "")

    process_discovery_result = await _run_agent(
        process_discovery_agent,
        combined_content,
        req_id,
    )

    shared_context = (
        "SOURCE INPUT:\n"
        f"{combined_content}\n\n"
        "PROCESS DISCOVERY RESULT:\n"
        f"{process_discovery_result}"
    )

    automation_strategy_result = await _run_agent(
        automation_strategy_agent,
        shared_context,
        req_id,
    )

    return {
        "process_discovery_result": process_discovery_result,
        "automation_strategy": automation_strategy_result
    }