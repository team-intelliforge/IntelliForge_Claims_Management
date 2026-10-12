from mcp.server.fastmcp import FastMCP
from threading import Lock, Thread
from llm_model import initialize_llm
import datetime
import logging
import httpx

#################################################################################

# load_dotenv()
logging.basicConfig(level=logging.INFO)

#################################################################################
mcp = FastMCP("Generating Adjudication Support for generating tasks/actinables MCP server", host="0.0.0.0", port=5683)


@mcp.tool()
def adjudication_support_engine(claim_id: str, data: str) -> str:
    """
    Generate adjudication support for the provided data.

    Args:
        claim_id (str): The ID of the claim for which adjudication support needs to be generated.
        data (str): The data for which adjudication support needs to be generated.
    Returns:
        str: result of the api call as JSON string
    """
    # Run backup in a background thread to avoid blocking
    import json

    with httpx.Client() as client:
        try:
            prompt = f"""
            Generate adjudication support for the following data:
            {data}
            Generate the list of actionables/tasks in the following format:
            [{
                "name": "",
                "description": "",
                "reasoning": ""
            }]
            """
            response = initialize_llm(prompt)
            response = response.text
            data = client.post(f"http://0.0.0.0:8082/add_actionable/{claim_id}", json={"actionables": response})
            data.raise_for_status()
            return response
        except httpx.HTTPError as e:
            logging.error(f"HTTP error occurred: {e}")
            return json.dumps({"error": str(e)})
        except Exception as e:
            logging.error(f"An error occurred: {e}")
            return json.dumps({"error": str(e)})
#################################################################################
#################################################################################

if __name__ == "__main__":
    # print("Registered tools:", dir(mcp))
    mcp.run(transport='streamable-http')  

    
#################################################################################