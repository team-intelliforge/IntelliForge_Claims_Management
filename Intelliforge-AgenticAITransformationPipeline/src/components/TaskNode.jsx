import { memo } from 'react';
import { Handle } from 'reactflow';

function TaskNode({ data }) {
  return (
    <div
      style={{
        padding: '5px 10px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderRadius: 7,
        backgroundColor: data.tool_type!=='rpa'?'white':'#FFF3E0',
        border: '2px solid rgba(0,0,0,.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
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
            flexShrink: 0,
            fontSize: '2rem',
          }}
        >
          {data.tool_type!=='rpa' ? <>🛠️</> : <>🤖</>}
        </div>

        {/* Text Container */}
        <div
          style={{
            marginLeft: '0.5rem',
            /* min-content forces the container to shrink-wrap the name's width */
            width: 'min-content', 
            minWidth: '16rem', // Optional: prevents it from being too tiny if name is short
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '1.3rem',
              fontWeight: '500',
              color: 'black',
              marginBottom: '5px',
              /* This forces the name to stay on one line no matter how long */
              whiteSpace: 'nowrap', 
            }}
          >
            {data.name}
          </div>

          {data?.description && (
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: '450',
                color: '#666666',
                /* Description will wrap once it hits the width established by the Name */
                wordBreak: 'break-word',
                lineHeight: '1.2',
              }}
            >
              {data?.description}
            </div>
          )}
        </div>
      </div>

      <Handle type='target' position={data.target} id='top' />
      <Handle type='source' position={data.source} id='bottom' />
    </div>
  );
}

export default memo(TaskNode);