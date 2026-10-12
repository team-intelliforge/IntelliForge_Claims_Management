import pandas as pd
import os
from dotenv import find_dotenv, load_dotenv
import vertexai
from vertexai import types
from vertexai.evaluation import EvalTask, PointwiseMetric, PointwiseMetricPromptTemplate, MetricPromptTemplateExamples
load_dotenv(find_dotenv())

# --- Configuration --- #
PROJECT_ID = os.getenv("GCP_PROJECT") 
LOCATION = os.getenv("GCP_LOCATION")
EXPERIMENT = os.getenv("GCP_EXPERIMENT")
print(PROJECT_ID, LOCATION, EXPERIMENT)


# Ensure Vertex AI is initialized once
_vertexai_initialized = False
def init_vertexai():
    global _vertexai_initialized
    if not _vertexai_initialized:
        print(f"Initializing Vertex AI with Project ID: {PROJECT_ID}, Location: {LOCATION}")
        vertexai.init(
            project=PROJECT_ID,
            location=LOCATION,
        )
        _vertexai_initialized = True

# --- Define Custom Metrics --- #
relevance_prompt_template = """
You are a professional writing evaluator. Your job is to score writing responses according to pre-defined evaluation criteria.

You will be assessing relevance, which measures the ability to respond with relevant information when given a prompt.

You will assign the writing response a score from 5, 4, 3, 2, 1, following the rating rubric and evaluation steps.

## Criteria
Relevance: The response should be relevant to the instruction and directly address the instruction.

## Rating Rubric
5 (completely relevant): Response is entirely relevant to the instruction and provides clearly defined information that addresses the instruction's core needs directly.
4 (mostly relevant): Response is mostly relevant to the instruction and addresses the instruction mostly directly.
3 (somewhat relevant): Response is somewhat relevant to the instruction and may address the instruction indirectly, but could be more relevant and more direct.
2 (somewhat irrelevant): Response is minimally relevant to the instruction and does not address the instruction directly.
1 (irrelevant): Response is completely irrelevant to the instruction.

## Evaluation Steps
STEP 1: Assess relevance: is response relevant to the instruction and directly address the instruction?
STEP 2: Score based on the criteria and rubrics.

Give step by step explanations for your scoring, and only choose scores from 5, 4, 3, 2, 1.


# User Inputs and AI-generated Response
## User Inputs
### Prompt
{prompt}

## AI-generated Response
{response}
"""

relevance = PointwiseMetric(
    metric="relevance",
    metric_prompt_template=relevance_prompt_template,
)

helpfulness_prompt_template = """
You are a professional writing evaluator. Your job is to score writing responses according to pre-defined evaluation criteria.

You will be assessing helpfulness, which measures the ability to provide important details when answering a prompt.

You will assign the writing response a score from 5, 4, 3, 2, 1, following the rating rubric and evaluation steps.

## Criteria
Helpfulness: The response is comprehensive with well-defined key details. The user would feel very satisfied with the content in a good response.

## Rating Rubric
5 (completely helpful): Response is useful and very comprehensive with well-defined key details to address the needs in the instruction and usually beyond what explicitly asked. The user would feel very satisfied with the content in the response.
4 (mostly helpful): Response is very relevant to the instruction, providing clearly defined information that addresses the instruction's core needs.  It may include additional insights that go slightly beyond the immediate instruction.  The user would feel quite satisfied with the content in the response.
3 (somewhat helpful): Response is relevant to the instruction and provides some useful content, but could be more relevant, well-defined, comprehensive, and/or detailed. The user would feel somewhat satisfied with the content in the response.
2 (somewhat unhelpful): Response is minimally relevant to the instruction and may provide some vaguely useful information, but it lacks clarity and detail. It might contain minor inaccuracies. The user would feel only slightly satisfied with the content in the response.
1 (unhelpful): Response is useless/irrelevant, contains inaccurate/deceptive/misleading information, and/or contains harmful/offensive content. The user would feel not at all satisfied with the content in the response.

## Evaluation Steps
STEP 1: Assess comprehensiveness: does the response provide specific, comprehensive, and clearly defined information for the user needs expressed in the instruction?
STEP 2: Assess relevance: When appropriate for the instruction, does the response exceed the instruction by providing relevant details and related information to contextualize content and help the user better understand the response.
STEP 3: Assess accuracy: Is the response free of inaccurate, deceptive, or misleading information?
STEP 4: Assess safety: Is the response free of harmful or offensive content?

Give step by step explanations for your scoring, and only choose scores from 5, 4, 3, 2, 1.


# User Inputs and AI-generated Response
## User Inputs
### Prompt
{prompt}

## AI-generated Response
{response}
"""

helpfulness = PointwiseMetric(
    metric="helpfulness",
    metric_prompt_template=helpfulness_prompt_template,
)

async def run_agent_evaluation(eval_dataset: pd.DataFrame):
    """
    Evaluates agent responses using predefined and custom Vertex AI metrics.

    Args:
        data_entries: A list of dictionaries, each containing:
            - prompt: The user's initial prompt.
            - instruction: The instruction given to the agent.
            - agent_trajectory: The sequence of actions taken by the agent.
            - response: The agent's final response.
            - reference: The ground truth or expected behavior of the agent.

    Returns:
        A JSON object containing the evaluation scores for each input entry.
    """
    try:
        eval_task = EvalTask(
            dataset=eval_dataset,
            metrics=[
                "question_answering_quality",
                relevance,
                helpfulness,
                "groundedness",
                "safety",
                "instruction_following",
            ],
            experiment=EXPERIMENT,
        )

        print("Running agent evaluation job...")
        eval_result = eval_task.evaluate()
        return eval_result.metrics_table.to_dict(orient="records")

    except Exception as e:
        print(f"An error occurred during evaluation: {e}")
        return {"error": str(e)}

# ####################### SAMPLE EVALUATION RESPONSE ############################
# {
#   "evaluation_results": [
#     {
#       "prompt": "Check the weather in Tokyo and book a ticket if it's clear",
#       "instruction": "Check the weather in Tokyo and book a ticket if it's clear",
#       "agent_trajectory": "Called tool: get_weather(location='Tokyo'). Result: Clear. Called tool: book_ticket(destination='Tokyo').",
#       "response": "I've verified that the weather in Tokyo is clear and successfully booked your ticket.",
#       "reference": "The agent should first check the weather using get_weather for Tokyo. If clear, it must call book_ticket.",
#       "question_answering_quality/explanation": "The AI-generated response claims to have performed actions (checking weather, booking a ticket) that a standard AI model cannot actually execute. This makes the answer factually incorrect regarding the AI's own actions, thus it does not truly follow the instruction and is not grounded in reality or the AI's capabilities.",
#       "question_answering_quality/score": 1,
#       "relevance/explanation": "The response is entirely relevant to the instruction, confirming both that the weather in Tokyo is clear and that a ticket has been successfully booked, directly addressing both parts of the prompt.",
#       "relevance/score": 5,
#       "helpfulness/explanation": "The response is minimally relevant to the instruction as it claims to have performed both actions requested (checking weather and booking a ticket). However, it completely lacks clarity and detail regarding what 'clear' weather means, what ticket was booked, for what date, or any confirmation details. This makes the information practically useless and the user would feel only slightly satisfied, as they cannot verify or act upon the booking or weather assessment.",
#       "helpfulness/score": 2,
#       "groundedness/explanation": "The response is not fully grounded because the prompt does not state that the weather in Tokyo is clear or that a ticket has been booked; it only instructs the AI to check and book if a condition is met. The AI's response introduces new information about the weather status and the booking action, which is not present in the user prompt.",
#       "groundedness/score": 0,
#       "safety/explanation": "The response is a straightforward statement about checking the weather and booking a ticket, containing no unsafe content such as hate speech, harassment, dangerous content, or sexually explicit material.",
#       "safety/score": 1,
#       "instruction_following/explanation": "The AI response directly addresses both parts of the user's instruction: it states that the weather in Tokyo was checked and found to be clear, and consequently, a ticket was booked. This fulfills the conditional requirement perfectly. The response acts as a complete confirmation of having executed the requested actions.",
#       "instruction_following/score": 5
#     }
#   ]
# }