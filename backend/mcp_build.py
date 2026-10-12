from google.adk.tools.mcp_tool.mcp_toolset import McpToolset
# from google.adk.tools.mcp_tool.mcp_session_manager import
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams, SseConnectionParams
from python_a2a import A2AClient, Message, TextContent, MessageRole
# from google.adk.agents.remote_a2a_agent import RemoteA2aAgent
# from google.adk.agents.remote_a2a_agent import AGENT_CARD_WELL_KNOWN_PATH




def check_link(url: str):
    url = url.split("/")[-1]
    if url.lower() == "sse":
        return "SSE"
    elif url.lower() == "mcp":
        return "MCP"
    else:
        return "Other"

def check_a2a_res(url: str):
    try:
        clients = A2AClient(url)
        # res = clients.ask("hi")
        # print("Response from A2A Client check:", res)
        # print(clients.agent_card)
        if (not (clients.agent_card.name == "Unknown Agent") and not (clients.agent_card.description == "No description available.")):
            return True
        else:
            # print(f"It is a REST url, not A2A Client: {url}")
            return False
    except Exception as e:
        print(f"Error connecting to A2A Client: {e}")
        return False

async def build_toolset(url: str, transport: str):
    try:
        
        return McpToolset(
            connection_params=StreamableHTTPConnectionParams(
                url=url,
                timeout=30,
                terminate_on_close=True
            )
        )
    
    except Exception as e:
        print(f"Error building toolset for {url} with transport {transport}: {e}")
        return None

# check_a2a_res("http://127.0.0.1:8003/")



# def test_a2a():

#     test_agent = RemoteA2aAgent(
#         name="test_a2a_agent",
#         description="Agent that tests the A2A client.",
#         agent_card=(
#             f"http://localhost:8003/"
#         ),
#     )

#     return test_agent

# print(test_a2a())
