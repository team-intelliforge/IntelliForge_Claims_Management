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
mcp = FastMCP("Extract the location data MCP server", host="0.0.0.0", port=5680)


@mcp.tool()
def location_data_geocoder(claim_id: str) -> str:
    """
    Extract the location data using api call and back it up.

    Args:
        claim_id (str): The ID of the claim whose location data needs to be extracted.
    Returns:
        str: result of the api call as JSON string
    """
    # Run backup in a background thread to avoid blocking
    import json

    with httpx.Client() as client:
        try:
            response = client.get(f"http://0.0.0.0:8082/get_location_and_device_details/{claim_id}", timeout=60.0)
            response.raise_for_status()
            resp = response.json()
            patient_location = resp.get("location_details").get("patient_location")
            physician_location = resp.get("location_details").get("physician_location")
            lab_location = resp.get("location_details").get("lab_location")
            return {
                "patient_location": patient_location,
                "physician_location": physician_location,
                "lab_location": lab_location
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