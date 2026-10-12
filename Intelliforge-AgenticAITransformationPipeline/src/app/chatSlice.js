import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  message_array: [{
    content: "Execute the Agentic Workflow",
    type: 'bot',
    first: true,
  }],
  flow_diagram: [],
  graph_data:[],
  step: 1,
  uuid: "" + uuidv4(),
  typing: false,
  console_data: '',
  console_enable: false,
  yaml_code: '',
  yaml_loading: false,
  yaml_thought: [],
  yaml_prompt: '',
  old_yaml: '',
  yaml_status: '',
  selectedFile: [],
  type: ' ',
  firstTabData:null,
  collapse:true,
  consoleData2:[],
  eval_data:[],
  chainOfThought:'',
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateUuid: (state, action) => {
      state.uuid = action.payload;
    },
    updateMessageArray: (state, action) => {
      state.message_array = action.payload;
    },
    updateTyping: (state, action) => {
      state.typing = action.payload;
    },
    updateConsoleData: (state, action) => {
      state.console_data = action.payload;
    },
    updateConsoleEnable: (state, action) => {
      state.console_enable = action.payload;
    },
    updateYamlCode: (state, action) => {
      state.yaml_code = action.payload;
    },
    updateYamlLoading: (state, action) => {
      state.yaml_loading = action.payload;
    },
    updateYamlThought: (state, action) => {
      state.yaml_thought = action.payload;
    },
    updateYamlPrompt: (state, action) => {
      state.yaml_prompt = action.payload;
    },
    updateOldYaml: (state, action) => {
      state.old_yaml = action.payload;
    },
    updateYamlStatus: (state, action) => {
      state.yaml_status = action.payload;
    },
    updateFlowDiagram: (state, action) => {
      state.flow_diagram = action.payload;
    },
    updateStep: (state, action) => {
      state.step = action.payload;
    },
    updateSelectedFile: (state, action) => {
      state.selectedFile = action.payload;
    },
    updateType: (state, action) => {
      state.type = action.payload;
    },
    updateFirstTabData: (state, action) => {
      state.firstTabData = action.payload;
    },
    updateCollapse: (state, action) => {
      state.collapse = action.payload;
    },
    updateAll: (state, action) => {
      return action.payload;
    },
    updateConsoleData2: (state,action) => {
      state.consoleData2 = action.payload
    },
    updateGraphData: (state,action) => {
      state.graph_data = action.payload
    },
    updateEvalData:(state,action) => {
      state.eval_data = action.payload
    },
    updateChainOfThought: (state,action) => {
      state.chainOfThought = action.payload
    }
  }
}); 

export const {updateChainOfThought, updateEvalData,updateGraphData, updateConsoleData2,updateAll,updateCollapse, updateUuid, updateSelectedFile, updateType, updateStep, updateMessageArray, updateTyping, updateConsoleData, updateConsoleEnable, updateYamlCode, updateYamlLoading, updateYamlThought, updateYamlPrompt, updateOldYaml, updateYamlStatus, updateFlowDiagram, updateFirstTabData } = chatSlice.actions;
export default chatSlice.reducer;
