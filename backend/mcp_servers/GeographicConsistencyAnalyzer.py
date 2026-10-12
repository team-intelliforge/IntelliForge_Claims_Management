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
mcp = FastMCP("Analysing the geographic consistency MCP server", host="0.0.0.0", port=5681)


@mcp.tool()
def geographic_consistency_analyzer(location_data: str) -> str:
    """
    Analyze the geographic consistency of the provided location data.

    Args:
        location_data (str): The location data to be analyzed for geographic consistency.
    Returns:
        str: result of the api call as JSON string
    """
    # Run backup in a background thread to avoid blocking
    import json

    with httpx.Client() as client:
        try:
            response = initialize_llm("Analyze the geographic consistency of the following location data: " + location_data + "Check if the patient will be able to travel the distance between the locations mentioned.")
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