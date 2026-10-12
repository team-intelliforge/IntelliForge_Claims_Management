from mcp.server.fastmcp import FastMCP
from threading import Lock, Thread
# from dotenv import load_dotenv
import datetime
import logging
import httpx

#################################################################################

# load_dotenv()
logging.basicConfig(level=logging.INFO)

#################################################################################
mcp = FastMCP("Extract the claim data MCP server", host="0.0.0.0", port=5682)


@mcp.tool()
async def system_data_collector(claim_id: str) -> str:
    """
    Extract the claim data using api call and back it up.

    Args:
        claim_id (str): The ID of the claim whose data needs to be extracted.
    Returns:
        str: result of the api call as JSON string
    """
    # Run backup in a background thread to avoid blocking
    import json

    async with httpx.Client() as client:
        try:
            claims_details = await client.get(f"http://0.0.0.0:8082/get_claim_information/{claim_id}", timeout=60.0)
            claims_details.raise_for_status()
            claims = claims_details.json()
            patient_id = claims.get("patient_id")
            patient_details = await client.get(f"http://0.0.0.0:8082/get_patient_data/{patient_id}", timeout=60.0)
            patient_details.raise_for_status()
            patient_details = patient_details.json()
            
            return {
                "patient_data": patient_details,
                "claim_details": claims,
            }
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