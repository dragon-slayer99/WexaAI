import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import ReactFlow, {
    Background,
    Controls,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './Pathfinder.css';

// Default graph styling adhering to the design system
const nodeStyle = {
    background: '#000000',
    color: '#ffffff',
    border: '1px solid #ffffff',
    borderRadius: '0px',
    padding: '16px 24px',
    fontFamily: '"Inter Tight", sans-serif',
    fontSize: '14px',
    fontWeight: '700',
    textAlign: 'center',
    minWidth: '150px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
};

const edgeOptions = {
    style: { stroke: '#ffed00', strokeWidth: 2 }, // Sunlight Yellow accent
    animated: true,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#ffed00',
    },
};

export default function Pathfinder() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Initial parameters from URL (e.g. ?source=Numb&target=Believer)
    const [source, setSource] = useState(searchParams.get('source') || '');
    const [target, setTarget] = useState(searchParams.get('target') || '');

    // React Flow state
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const fetchPath = useCallback(() => {
        if (!source || !target) return;

        setLoading(true);
        setError(null);

        fetch(`${API_BASE}/api/songs/path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`)
            .then((res) => {
                if (!res.ok) {
                    if (res.status === 204) throw new Error('No path found between these nodes.');
                    throw new Error('Failed to compute graph path.');
                }
                return res.json();
            })
            .then((pathsData) => {
                if (!pathsData || pathsData.length === 0 || !Array.isArray(pathsData[0])) {
                    throw new Error('No path found.');
                }

                const uniqueNodes = new Map();
                const uniqueEdges = new Map();

                // Loop through EVERY path returned by the endpoint
                pathsData.forEach((path, pathIndex) => {
                    path.forEach((nodeString, stepIndex) => {

                        // 1. Create the node if it doesn't exist yet
                        if (!uniqueNodes.has(nodeString)) {
                            const parts = nodeString.split(':');
                            const type = parts.length > 1 ? parts[0].trim() : 'Node';
                            const name = parts.length > 1 ? parts[1].trim() : nodeString;

                            uniqueNodes.set(nodeString, {
                                id: nodeString, // Use the string itself as a unique ID
                                data: {
                                    label: (
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#ffed00', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                {type}
                                            </div>
                                            <div>{name}</div>
                                        </div>
                                    )
                                },
                                // Layout logic: X advances per step, Y is staggered by path index
                                position: {
                                    x: stepIndex * 300,
                                    y: pathIndex * 150
                                },
                                style: nodeStyle
                            });
                        } else {
                            // If node exists (like the source/target), center it vertically
                            const existingNode = uniqueNodes.get(nodeString);
                            if (stepIndex === 0 || stepIndex === path.length - 1) {
                                existingNode.position.y = (pathsData.length * 150) / 4;
                            }
                        }

                        // 2. Create the edge connecting to the PREVIOUS node in this specific path
                        if (stepIndex > 0) {
                            const prevNodeString = path[stepIndex - 1];
                            const edgeId = `edge-${prevNodeString}-${nodeString}`;

                            if (!uniqueEdges.has(edgeId)) {
                                uniqueEdges.set(edgeId, {
                                    id: edgeId,
                                    source: prevNodeString,
                                    target: nodeString,
                                    ...edgeOptions
                                });
                            }
                        }
                    });
                });

                setNodes(Array.from(uniqueNodes.values()));
                setEdges(Array.from(uniqueEdges.values()));
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message);
                setNodes([]);
                setEdges([]);
                setLoading(false);
            });
    }, [source, target]);

    // Execute search if params exist on mount
    useEffect(() => {
        if (source && target) {
            fetchPath();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (source && target) {
            navigate(`/path?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`, { replace: true });
            fetchPath();
        }
    };

    return (
        <div className="pathfinder-page">
            {/* Floating UI Panel */}
            <div className="control-panel">
                <h1 className="panel-title">Graph Traversal</h1>

                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-group">
                        <label className="input-label">Source Node (Song)</label>
                        <input
                            type="text"
                            className="path-input"
                            placeholder="e.g., Numb"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Target Node (Song)</label>
                        <input
                            type="text"
                            className="path-input"
                            placeholder="e.g., Believer"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-traverse" disabled={loading}>
                        {loading ? 'CALCULATING...' : 'FIND SHORTEST PATH'}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>}
                {!error && !loading && nodes.length > 0 && (
                    <p className="status-message">Path found: {nodes.length - 1} hops</p>
                )}
            </div>

            {/* React Flow Graph Canvas */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.5 }}
            >
                <Background color="#333333" gap={24} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}