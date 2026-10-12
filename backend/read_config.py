"""
Configuration File Reader Module

This module provides functionality to read and parse YAML configuration files. It handles file existence checking, YAML
parsing, and provides appropriate error handling for configuration loading.
"""

# Import necessary libraries
import yaml  # PyYAML library for parsing YAML configuration files
import os    # Operating system interface for file operations
from pathlib import Path

# Function to read the configuration file
def read_config(config_uuid: str = None, name:str = "config.yaml"):
    """
    Read the configuration file and return the contents as a dictionary.
    
    This function attempts to load the main configuration file from the
    'configs/config.yaml' path. It performs file existence checking and
    YAML parsing with appropriate error handling.
    
    Returns:
        dict: Configuration data parsed from the YAML file, or None if file doesn't exist
        
    Raises:
        yaml.YAMLError: If the YAML file contains invalid syntax
        IOError: If there are file reading permissions or access issues
        Exception: For any other unexpected errors during file processing
    """
    # Check if a specific config path is set via environment variable
    # if 'CURRENT_CONFIG_PATH' in os.environ:
    #     config_path = Path(os.environ['CURRENT_CONFIG_PATH'])
    # else:
        # Fallback to default path (for backward compatibility)
    config_path = Path(f"configs/{config_uuid}/config.yaml")

    # Check if the configuration file exists before attempting to read it
    # This prevents FileNotFoundError and provides cleaner error handling
    if config_path.exists():
        try:
            # Open and read the YAML configuration file
            # Using 'r' mode for reading text files with proper encoding handling
            with open(config_path, 'r', encoding='utf-8') as file:
                # Parse the YAML content safely to prevent code injection
                # yaml.safe_load() is preferred over yaml.load() for security
                config = yaml.safe_load(file)
                
                # Validate that the loaded config is a dictionary
                # YAML files should contain structured configuration data
                if not isinstance(config, dict):
                    print(f"Warning: Configuration file does not contain a valid dictionary structure")
                    return None
                
                # Log successful configuration loading
                print(f"Configuration loaded successfully from {config_path}")
                return config
                
        except yaml.YAMLError as e:
            # Handle YAML parsing errors (syntax errors, invalid format)
            print(f"Error: Invalid YAML syntax in configuration file: {e}")
            raise yaml.YAMLError(f"Failed to parse YAML configuration: {e}")
            
        except IOError as e:
            # Handle file I/O errors (permissions, disk issues, etc.)
            print(f"Error: Cannot read configuration file: {e}")
            raise IOError(f"Failed to read configuration file: {e}")
            
        except Exception as e:
            # Handle any other unexpected errors during configuration loading
            print(f"Error: Unexpected error while loading configuration: {e}")
            raise Exception(f"Unexpected error loading configuration: {e}")
    
    else:
        # Log when configuration file is not found
        # This is not necessarily an error condition, depending on application design
        print(f"Warning: Configuration file not found at {config_path}")
        print("Application may use default settings or require configuration upload")
        return None

def get_config_value(key_path, default=None):
    """
    Get a specific configuration value using dot notation path.
    
    This helper function provides a convenient way to access nested
    configuration values with fallback to default values.
    
    Args:
        key_path (str): Dot-separated path to the configuration value (e.g., 'llm.model')
        default: Default value to return if the key is not found
        
    Returns:
        Any: The configuration value at the specified path, or default if not found
        
    Example:
        >>> get_config_value('llm.model', 'gpt-3.5-turbo')
        'gpt-4'
    """
    # Load the configuration
    config = read_config(name="config.yaml")
    
    # Return default if configuration couldn't be loaded
    if config is None:
        return default
    
    # Split the key path and traverse the nested dictionary
    keys = key_path.split('.')
    current_value = config
    
    try:
        # Navigate through nested dictionary levels
        for key in keys:
            current_value = current_value[key]
        return current_value
        
    except (KeyError, TypeError):
        # Return default value if any key in the path doesn't exist
        # or if we encounter a non-dictionary value in the path
        return default

def validate_required_config():
    """
    Validate that all required configuration sections are present.
    
    This function checks for essential configuration sections that
    the application needs to function properly.
    
    Returns:
        bool: True if all required sections are present, False otherwise
        
    Raises:
        Exception: If configuration is completely missing or invalid
    """
    # Load configuration for validation
    config = read_config(name="config.yaml")
    
    # Check if configuration was loaded successfully
    if config is None:
        raise Exception("Configuration file is required but not found")
    
    # Define required configuration sections
    required_sections = ['llm', 'agents', 'workflow']
    
    # Check each required section
    missing_sections = []
    for section in required_sections:
        if section not in config:
            missing_sections.append(section)
    
    # Report missing sections
    if missing_sections:
        print(f"Error: Missing required configuration sections: {missing_sections}")
        return False
    
    # All required sections are present
    print("Configuration validation passed")
    return True
