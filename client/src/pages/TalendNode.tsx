// Updated TalendNode.tsx - WITH DOUBLED DIMENSIONS, PROPER SCALING, AND ROLE-STRIPPED LABELS
import React, { memo, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
import { getComponentIcon, getCategoryColor } from './ComponentRegistry';
import { FlowNodeMeta } from '../types/metadata';

interface TalendNodeData extends FlowNodeMeta {}

const TalendNode = memo(({ data, selected, id }: NodeProps<TalendNodeData>) => {
  const { label, componentType, componentKey, status } = data;
  const textContainerRef = useRef<HTMLDivElement>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const nodeId = id || data.metadata?.id;
  
  // Map componentType to category – now includes new roles
  const category = 
    componentType === 'INPUT' ? 'input' :
    componentType === 'OUTPUT' ? 'output' :
    componentType === 'ANALYTICS' ? 'analytics' :
    componentType === 'VISUALIZATION' ? 'visualization' :
    'transform'; // fallback
  
  const categoryColor = getCategoryColor(category);
  const icon = getComponentIcon(componentKey);
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return categoryColor;
    }
  };

  // Function to format the display label by stripping out the role segment
  const formatDisplayLabel = useCallback(() => {
    const parts = label.split('_');
    // Expected format: componentName_ROLE_instanceNumber
    if (parts.length >= 3) {
      const possibleRole = parts[parts.length - 2];
      if (['INPUT', 'OUTPUT', 'TRANSFORM', 'ANALYTICS', 'VISUALIZATION'].includes(possibleRole)) {
        // Remove the role part (second last)
        const filteredParts = parts.filter((_, index) => index !== parts.length - 2);
        return filteredParts.join('_');
      }
    }
    return label;
  }, [label]);

  // Setup ResizeObserver for text container
  useEffect(() => {
    const textContainer = textContainerRef.current;
    if (!textContainer) return;

    const observer = new ResizeObserver(() => {
      updateNodeInternals(nodeId);
    });

    observer.observe(textContainer);

    return () => {
      if (textContainer) {
        observer.unobserve(textContainer);
      }
      observer.disconnect();
    };
  }, [nodeId, updateNodeInternals]);

  const displayLabel = formatDisplayLabel();

  // Determine handle visibility based on componentType
  const showLeftHandle = 
    componentType === 'INPUT' ? false :
    componentType === 'OUTPUT' ? true :
    componentType === 'ANALYTICS' ? true :
    componentType === 'VISUALIZATION' ? true :
    false;

  const showRightHandle = 
    componentType === 'INPUT' ? true :
    componentType === 'OUTPUT' ? false :
    componentType === 'ANALYTICS' ? true :
    componentType === 'VISUALIZATION' ? false :
    false;

  return (
    <div
      className={`
        talend-node 
        relative 
        border-2 
        rounded-lg 
        flex 
        flex-col 
        items-center 
        justify-start
        transition-all 
        duration-200
        ${selected ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-md'}
        talend-node-role-${category}
      `}
      style={{
        borderColor: getStatusColor(),
        backgroundColor: `${categoryColor}08`,
        background: `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}03 100%)`,
        width: '100%',
        height: '100%',
        padding: '12px 8px',
        minWidth: '120px',
        minHeight: '80px',
      }}
      data-id={nodeId}
      data-role={category}
      onDoubleClick={(e) => {
        e.stopPropagation();
        
        if (componentKey === 'tMap') {
          const event = new CustomEvent('canvas-tmap-double-click', {
            detail: { nodeId, nodeMetadata: data }
          });
          window.dispatchEvent(event);
        } else {
          const event = new CustomEvent('canvas-node-double-click', {
            detail: {
              nodeMetadata: data,
              componentMetadata: {
                id: nodeId,
                name: displayLabel,
                type: componentKey,
                componentKey: componentKey,
                role: componentType,
                metadata: data.metadata
              }
            }
          });
          window.dispatchEvent(event);
        }
      }}
    >
      {/* Left Handle (input) – shown for all except INPUT */}
      {showLeftHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-white"
          style={{ backgroundColor: categoryColor }}
        />
      )}
      
      {/* Right Handle (output) – shown for all except OUTPUT */}
      {showRightHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-white"
          style={{ backgroundColor: categoryColor }}
        />
      )}
      
      {/* Icon */}
      <div 
        className="w-5 h-5 rounded-full flex items-center justify-center mb-1 shadow-sm flex-shrink-0"
        style={{ 
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}CC 100%)` 
        }}
      >
        <div className="text-white" style={{ fontSize: '1rem' }}>
          {React.isValidElement(icon) ? 
            React.cloneElement(icon as React.ReactElement<any>, { 
              className: 'w-2.5 h-2.5',
              style: { width: '2.5rem', height: '2.5rem' } 
            }) : 
            icon}
        </div>
      </div>
      
      {/* Text Container */}
      <div 
        ref={textContainerRef}
        className="text-center w-full flex-grow-0 talend-node-label"
        style={{
          fontFamily: 'Arial',
          fontSize: '13.34pt',
          fontStyle: 'normal',
          fontWeight: 'normal',
          color: '#000000',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.2',
          minWidth: '80px'
        }}
      >
        <div className="font-normal talend-node-label-text">
          {displayLabel}
        </div>
        
        {/* Status Indicator */}
        {status !== 'default' && (
          <div className="flex justify-center mt-0.5">
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

TalendNode.displayName = 'TalendNode';
export default TalendNode;