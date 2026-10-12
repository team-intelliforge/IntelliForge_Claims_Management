import { memo } from 'react';
import { Handle } from 'reactflow';

function AgentNode({ data }) {
  return (
    <div
      style={{
        padding: '5px 10px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderRadius: 7,
        backgroundColor: data.name==="Financial Advisor" ? 'white':'#F5F5F5',
        border: '2px solid rgba(0,0,0,.2)',
      }}
    >
      <div
        className='flex'
        style={{
          display: 'flex',
          alignItems: 'flex-start', // Aligns icon with the top of the text
        }}
      >
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0, // Keeps the icon from shrinking
            zIndex: '1000',
            fontSize: '2rem',
          }}
        >
          🧠
        </div>

        {/* Text Container: Wraps based on the name's width */}
        <div
          style={{
            marginLeft: '0.5rem',
            width: 'min-content', // Forces parent to match the widest unbreakable child (the name)
            minWidth: '15rem',
          }}
        >
          <div
            style={{
              fontSize: data.name==="Financial Advisor" ? '1.5rem' : '1.3rem',
              fontWeight: '500',
              color: data.name==="Financial Advisor" ? '#6b1fbcff':'#fd5f07',
              // color: 'black',
              marginBottom: '5px',
            }}
          >
            {data.name}
          </div>

          <hr style={{ border: '0.5px solid rgba(0,0,0,.1)', margin: '4px 0' }} />

          {data?.description && (
            <div
              style={{
                fontSize: '1.2rem',
                color: '#666666',
                overflowWrap: 'break-word',
                fontWeight: '450',
                lineHeight: '1.2',
              }}
            >
              {data?.description}
            </div>
          )}
        </div>
      </div>

      {data.name === "Financial Advisor" && (
        <div style={{ fontSize: '1.4rem', marginTop: '2vh', marginBottom: '2vh', justifySelf: 'end' }}>
          <a href={`https://console.cloud.google.com/agent-platform/agent-garden/samples/financial-advisor`} target="_blank" rel="noopener noreferrer" >
            Agent Garden
          </a>
        </div>
      )}

      {/* Handles */}
      <Handle type='target' position={data.target} id='top' />
      <Handle type='source' position={data.source} id='bottom' />
      <Handle type='target' position='bottom' id='target-bottom' />
      <Handle type='target' position='left' id='target-left' />
      <Handle type='target' position='right' id='target-right' />
      <Handle type='target' position='top' id='target-top' />
      <Handle type='source' position='left' id='source-left' />
      <Handle type='source' position='right' id='source-right' />
      <Handle type='source' position='top' id='source-top' />
      <Handle type='source' position='bottom' id='source-bottom' />
      <Handle type='target' position='bottom' id='target-bottom-left' style={{ left: '30%' }} />
      <Handle type='target' position='bottom' id='target-bottom-right' style={{ left: '70%' }} />
      <Handle type='source' position='bottom' id='source-bottom-left' style={{ left: '30%' }} />
      <Handle type='source' position='bottom' id='source-bottom-right' style={{ left: '70%' }} />
    </div>
  );
}

export default memo(AgentNode);