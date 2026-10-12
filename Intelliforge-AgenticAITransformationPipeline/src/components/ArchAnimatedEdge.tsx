import { BaseEdge, getBezierPath, type EdgeProps } from 'reactflow';

export function AnimatedSVGEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle r='5' fill='blue'>
        <animateMotion dur='4s' repeatCount='indefinite' path={edgePath} />
      </circle>
    </>
  );
}
