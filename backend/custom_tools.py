"""
Custom Tools Creation Module

This module provides functionality for dynamically creating custom tools
based on configuration data. It handles the generation of Python tool files
from function definitions and descriptions provided in the application configuration.
"""

# Import necessary libraries for file operations and directory management
import os
from typing import Optional
from pathlib import Path

def create_custom_tool(function_name: str, function_body: str, custom_description: Optional[str] = None, custom_prompt: str = ""):
    """
    Create a custom tool based on the configuration provided.
    
    This function takes a function name, body, and optional description to create
    a new Python module file in the custom tools directory. The generated tool
    can then be dynamically imported and used by agents in the system.
    
    Args:
        function_name (str): Name of the function to create (will be used as module name)
        function_body (str): Complete Python function definition as a string
        custom_description (str, optional): Description of the tool's functionality
        
    Raises:
        OSError: If there are issues creating directories or writing files
        SyntaxError: If the function_body contains invalid Python syntax
        Exception: For any other unexpected errors during tool creation
        
    Example:
        >>> function_body = '''
        ... def my_tool(input_data):
        ...     "A simple custom tool."
        ...     return f"Processed: {input_data}"
        ... '''
        >>> create_custom_tool("my_tool", function_body, "Processes input data")
    """
    print(f"Creating custom tool: {function_name}")
    
    # ==================== INPUT VALIDATION ====================
    
    # Validate that required parameters are provided
    if not function_name or not function_name.strip():
        raise ValueError("Function name cannot be empty")
    
    if not function_body or not function_body.strip():
        raise ValueError("Function body cannot be empty")
    
    # Clean the function name to ensure it's a valid Python identifier
    function_name = function_name.strip()
    if not function_name.isidentifier():
        raise ValueError(f"'{function_name}' is not a valid Python identifier")
    
    # ==================== DIRECTORY SETUP ====================
    
    # Ensure the custom tools directory exists
    custom_dir = Path("custom")
    if not custom_dir.exists():
        try:
            custom_dir.mkdir(parents=True, exist_ok=True)
            print(f"Created custom tools directory: {custom_dir}")
        except OSError as e:
            raise OSError(f"Failed to create custom directory: {str(e)}")
    
    # ==================== FUNCTION VALIDATION ====================
    
    # Store the function definition for processing
    # function_definition = function_body.strip()
    import re
    function_definition = re.sub(
        r'prompt\s*=\s*".*?"',
        f'prompt = """{custom_prompt}"""',
        function_body.strip()
    )
    # function_definition = function_definition.replace("custom_prompt", custom_prompt)
    print("Function Defination: ", function_definition)
    # Validate the Python syntax by attempting to compile the code
    try:
        compile(function_definition, f"<custom_tool_{function_name}>", "exec")
        print(f"Function syntax validation passed for: {function_name}")
    except SyntaxError as e:
        raise SyntaxError(f"Invalid Python syntax in function body: {str(e)}")
    
    # ==================== TOOL FILE GENERATION ====================
    
    # Generate the complete module content with proper formatting
    module_content = generate_module_content(function_name, function_definition, custom_description)
    
    # Define the output file path
    file_path = os.path.join(custom_dir, f"{function_name}.py")
    
    try:
        # Write the custom tool module to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(module_content)
        
        print(f"Custom tool created successfully: {file_path}")
        
        # ==================== POST-CREATION VALIDATION ====================
        
        # Verify the file was created and has content
        if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            print(f"File validation passed: {file_path}")
        else:
            raise OSError(f"Failed to create or write content to: {file_path}")
            
    except OSError as e:
        raise OSError(f"Failed to write custom tool file: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error creating custom tool: {str(e)}")

def generate_module_content(function_name: str, function_body: str, description: Optional[str] = None) -> str:
    """
    Generate the complete Python module content for a custom tool.
    
    This helper function creates a properly formatted Python module with
    docstring, imports, and the custom function definition.
    
    Args:
        function_name (str): Name of the function
        function_body (str): The function definition
        description (str, optional): Description of the tool
        
    Returns:
        str: Complete Python module content as a string
    """
    # Create module docstring with optional description
    if description:
        module_docstring = f'"""\nCustom Tool: {function_name}\n\n{description}\n"""'
    else:
        module_docstring = f'"""\nCustom Tool: {function_name}\n\nDynamically generated custom tool.\n"""'
    
    # Generate the complete module content
    module_content = f'''{module_docstring}

# This file was automatically generated by the custom_tools module
# Modification of this file may cause issues with tool loading

# Import any necessary libraries here
# (Add imports as needed based on your function requirements)

{function_body}

'''
    
    return module_content

def validate_custom_tool(function_name: str) -> bool:
    """
    Validate that a custom tool exists and can be imported.
    
    This utility function checks if a custom tool file exists and
    can be successfully imported without errors.
    
    Args:
        function_name (str): Name of the custom tool to validate
        
    Returns:
        bool: True if the tool is valid and importable, False otherwise
    """
    try:
        # Check if the file exists
        file_path = os.path.join("custom", f"{function_name}.py")
        if not os.path.exists(file_path):
            print(f"Custom tool file not found: {file_path}")
            return False
        
        # Try to import the module dynamically
        import importlib.util
        spec = importlib.util.spec_from_file_location(function_name, file_path)
        if spec is None:
            print(f"Failed to create module spec for: {function_name}")
            return False
        
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Check if the function exists in the module
        if not hasattr(module, function_name):
            print(f"Function '{function_name}' not found in custom tool module")
            return False
        
        print(f"Custom tool validation passed: {function_name}")
        return True
        
    except Exception as e:
        print(f"Custom tool validation failed for {function_name}: {str(e)}")
        return False

def list_custom_tools() -> list:
    """
    List all available custom tools in the custom directory.
    
    Returns:
        list: List of custom tool names (without .py extension)
    """
    custom_dir = Path("custom")
    if not custom_dir.exists():
        return []
    
    # Get all .py files in the custom directory
    tools = []
    for filename in os.listdir(custom_dir):
        if filename.endswith('.py') and not filename.startswith('__'):
            tool_name = filename[:-3]  # Remove .py extension
            tools.append(tool_name)
    
    return tools

def remove_custom_tool(function_name: str) -> bool:
    """
    Remove a custom tool file.
    
    Args:
        function_name (str): Name of the custom tool to remove
        
    Returns:
        bool: True if removal was successful, False otherwise
    """
    try:
        file_path = os.path.join("custom", f"{function_name}.py")
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Custom tool removed: {function_name}")
            return True
        else:
            print(f"Custom tool not found: {function_name}")
            return False
    except Exception as e:
        print(f"Failed to remove custom tool {function_name}: {str(e)}")
        return False