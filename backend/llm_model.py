
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

def initialize_llm():
    llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash-exp', api_key=os.getenv("GOOGLE_API_KEY"), temperature=0)
    return llm


def initialize_reasoning_llm():
    llm = ChatGoogleGenerativeAI(model='gemini-2.0-flash-exp', api_key=os.getenv("GOOGLE_API_KEY"), temperature=0)
    return llm