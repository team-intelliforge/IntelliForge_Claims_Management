"""
Tool Mapping Module

This module handles the dynamic loading and mapping of tools.
It manages both pre-defined tools and custom tools, creating a unified mapping dictionary
that can be used by agents throughout the system. The module supports automatic custom
tool creation and dynamic module importing for flexible tool management.
"""

# Import pre-defined tool functions from the tools directory
# These are standard tools that come with the application
# from pre_defined_tools import analysis_tool, resolution_tool, task_generation_tool, create_mcp_tool, initialize_a2a


# Import necessary libraries for dynamic module loading and file operations
import os                           # Operating system interface for file existence checks
import importlib                    # Dynamic module importing capabilities
from read_config import read_config # Configuration file reader
from custom_tools import create_custom_tool  # Custom tool creation functionality
# from context_variable import current_uuid


def tool_mapping(config_uuid="1234"):
    """
    Create a comprehensive mapping of tool names to tool functions.
    
    This function builds a dictionary that maps tool names (strings) to their
    corresponding callable functions. It handles both pre-defined tools and
    custom tools defined in the configuration.
    
    The function performs the following operations:
    1. Initialize mapping with pre-defined tools
    2. Scan agent configurations for custom tools
    3. Dynamically load existing custom tools
    4. Create and load missing custom tools
    5. Return complete tool mapping dictionary
    
    Returns:
        dict: Mapping of tool names (str) to tool functions (callable)
        
    Example:
        >>> tools = tool_mapping()
        >>> tools['extract_data']  # Returns the extract_data function
        >>> tools['my_custom_tool']  # Returns dynamically loaded custom function
    """
    # Load application configuration containing agent and tool definitions
    # config = read_config(config_uuid=current_uuid.get())
    config = read_config(config_uuid)  # Temporary static UUID for testing
    # print(config)
    # ==================== INITIALIZE PRE-DEFINED TOOLS ====================
    
    # Create initial mapping with all pre-defined tools
    # These tools are always available and don't require configuration
    TOOLS_MAPPING = {
        # "analysis_tool": analysis_tool,      # Analysis and insights generation
        # "resolution_tool": resolution_tool,                  # Problem resolution tools
        # "task_generation_tool": task_generation_tool,         # Task creation and management
        # "mcp_tool": create_mcp_tool,                       # mcp client
        # "a2a_tool": initialize_a2a                 # a2a client
    }
    
    # ==================== PROCESS CUSTOM TOOLS FROM CONFIGURATION ====================
    
    # Iterate through all configured agents to find custom tools
    for agent_config in config["agents"]:
        # Check each tool configured for the current agent
        for tool_config in agent_config["tools"]:
            # Only process explicitly marked custom tools with valid names
            if (
                tool_config.get("type") == "custom_tool"
                and tool_config.get("tool_name")
            ):
                
                # Extract module name from tool configuration
                module_name = tool_config["tool_name"]
                
                # ==================== CREATE MISSING CUSTOM TOOLS ====================
                print(f"Creating missing custom tool: {module_name}")
                
                try:
                    # Create the custom tool file with provided configuration
                    create_custom_tool(
                        function_name=module_name,
                        function_body=tool_config['config']['tool_body'],
                        custom_description=tool_config['config']['tool_description'],
                        custom_prompt=tool_config.get('config', {}).get('prompt', "")  # Newly added
                    )
                    
                    print(f"Custom tool {module_name} created successfully")
                    
                    # Ensure Python doesn't serve a previously cached module/version
                    import importlib, sys
                    importlib.invalidate_caches()
                    module_qualname = f"custom.{module_name}"

                    # If the module is already loaded, reload it to pick up updated URL/body
                    if module_qualname in sys.modules:
                        module = importlib.reload(sys.modules[module_qualname])
                    else:
                        module = importlib.import_module(module_qualname)

                    # Extract the callable from the freshly (re)loaded module
                    custom_function = getattr(module, module_name)
                    
                    # Add the newly created tool to the mapping
                    TOOLS_MAPPING[module_name] = custom_function
                    
                    print(f"Successfully loaded newly created custom tool: {module_name}")
                    
                except (ImportError, AttributeError) as e:
                    # Handle errors in tool creation or loading
                    print(f"Failed to create or load custom tool {module_name}: {str(e)}")
                    print(f"  - Check tool configuration in config file")
                    print(f"  - Verify tool_body contains valid Python code")
                    print(f"  - Ensure write permissions for custom/ directory")
                    continue
                
                except Exception as e:
                    # Handle any other unexpected errors during tool creation
                    print(f"Unexpected error creating custom tool {module_name}: {str(e)}")
                    continue
    
    # ==================== RETURN COMPLETE TOOL MAPPING ====================
    
    # Log the final tool mapping for debugging purposes
    print(f"Tool mapping completed. Available tools: {list(TOOLS_MAPPING.keys())}")
    print(f"Total tools loaded: {len(TOOLS_MAPPING)}")
    
    # Return the complete mapping of tool names to functions
    return TOOLS_MAPPING

