import "./style.scss";
import * as React from "react";
import { find, deepClone } from "lodash";
import { TransitionGroup, CSSTransition } from "react-transition-group";

interface SuperTreeviewProps {
    data: Record<any, any> | Array<Record<any, any>>;
    depth?: number;

    deleteElement?: JSX.Element;

    getStyleClassCb?: (any) => any;

    isCheckable: (any, depth?: number) => boolean;
    isDeletable: (any, depth?: number) => boolean;
    isExpandable: (any, depth?: number) => boolean;

    keywordChildren?: string;
    keywordChildrenLoading?: string;
    keywordKey?: string;
    keywordLabel?: string;

    loadingElement?: JSX.Element;
    noChildrenAvailableMessage?: string;

    onCheckToggleCb: (any, depth?: number) => any;
    onDeleteCb: (any, newdata: any, depth?: number) => any;
    onExpandToggleCb: (any, depth?: number) => any;
    onUpdateCb: (any, depth?: number) => any;

    transitionEnterTimeout?: number;
    transitionExitTimeout?: number;
}
interface SuperTreeviewState {
    lastCheckToggledNodeIndex: number | null;

    data: Array<Record<any, any>>;
    depth: number;

    deleteElement: JSX.Element;

    keywordChildren: string;
    keywordChildrenLoading: string;
    keywordKey: string;
    keywordLabel: string;

    loadingElement: JSX.Element;
    noChildrenAvailableMessage: string;

    transitionEnterTimeout: number;
    transitionExitTimeout: number;
}

class SuperTreeview extends React.Component<
    SuperTreeviewProps,
    SuperTreeviewState
> {
    static defaultProps = {
        lastCheckToggledNodeIndex: null,
        isDeletable: () => true,
        isCheckable: () => true,
        isExpandable: () => true,
        onCheckToggleCb: (/* Array of nodes, depth */) => {},
        onDeleteCb: () => true,
        onExpandToggleCb: () => {},
        onUpdateCb: () => {}
    };
    // handleUpdate: any
    // printNodes: any
    // printChildren: any
    // printCheckbox: any
    // printDeleteButton: any
    // printExpandButton: any
    // printNoChildrenMessage: any
    // handleCheckToggle: any
    // handleDelete: any
    // handleExpandToggle: any

    constructor(props: SuperTreeviewProps) {
        super(props);
        this.handleUpdate = this.handleUpdate.bind(this);

        this.printNodes = this.printNodes.bind(this);
        this.printChildren = this.printChildren.bind(this);

        this.printCheckbox = this.printCheckbox.bind(this);
        this.printDeleteButton = this.printDeleteButton.bind(this);
        this.printExpandButton = this.printExpandButton.bind(this);
        this.printNoChildrenMessage = this.printNoChildrenMessage.bind(this);

        this.handleCheckToggle = this.handleCheckToggle.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleExpandToggle = this.handleExpandToggle.bind(this);
        this.setState(this.makeState(props));
    }

    componentWillMount() {
        this.setState(this.makeState(this.props));
    }

    makeState(props: SuperTreeviewProps) {
        const {
            data,
            depth,
            deleteElement,
            keywordChildren,
            keywordChildrenLoading,
            loadingElement,
            keywordKey,
            keywordLabel,
            noChildrenAvailableMessage
        } = props;

        return {
            data: data instanceof Array ? data : [data],
            lastCheckToggledNodeIndex: null,
            depth: depth || 0,
            deleteElement: deleteElement || <div>(X)</div>,
            keywordChildren: keywordChildren || "children",
            keywordChildrenLoading:
                keywordChildrenLoading || "isChildrenLoading",
            keywordLabel: keywordLabel || "name",
            keywordKey: keywordKey || "id",

            loadingElement: loadingElement || <div>loading...</div>,

            noChildrenAvailableMessage:
                noChildrenAvailableMessage || "No data found"
        };
    }

    componentWillReceiveProps(nextProps: SuperTreeviewProps) {
        this.setState({
            data:
                nextProps.data instanceof Array
                    ? nextProps.data
                    : [nextProps.data]
        });
    }

    handleUpdate(updatedData) {
        const { depth, onUpdateCb } = this.props;
        this.setState({ data: updatedData });
        if (onUpdateCb)
            onUpdateCb(
                updatedData
                    ? updatedData.length === 1
                        ? updatedData[0]
                        : updatedData
                    : null,
                depth
            );
    }

    handleCheckToggle(node: any, e) {
        const { onCheckToggleCb, depth } = this.props;
        const { lastCheckToggledNodeIndex, data } = this.state;
        const dataClone = deepClone(data)
        const currentNode = find(dataClone, node);
        const currentNodeIndex = dataClone.indexOf(currentNode);
        const getToggledNodes = () => {
            if (e.shiftKey && !(lastCheckToggledNodeIndex === null)) {
                const rangeStart = Math.min(
                    currentNodeIndex,
                    lastCheckToggledNodeIndex
                );
                const rangeEnd = Math.max(
                    currentNodeIndex,
                    lastCheckToggledNodeIndex
                );

                const nodeRange = dataClone.slice(rangeStart, rangeEnd + 1);

                return nodeRange.map(node => {
                    node.isChecked = e.target.checked;
                    return node;
                });
            } else {
                currentNode.isChecked = e.target.checked;
                return [currentNode];
            }
        };

        const nodes = getToggledNodes();

        if (onCheckToggleCb) onCheckToggleCb(nodes, depth);
        this.setState({ lastCheckToggledNodeIndex: currentNodeIndex });
        this.handleUpdate(nodes);
    }

    handleDelete(node) {
        const { onDeleteCb, depth } = this.props;
        const data = deepClone(this.state.data)

        const newData = data.filter(nodeItem => {
            return node.id !== nodeItem.id;
        });

        if (onDeleteCb)
            onDeleteCb(node, newData, depth) && this.handleUpdate(newData);
    }

    handleExpandToggle(node) {
        const { onExpandToggleCb, depth } = this.props;
        const data = deepClone(this.state.data);
        const currentNode = find(data, node);

        currentNode.isExpanded = !currentNode.isExpanded;

        if (onExpandToggleCb) onExpandToggleCb(currentNode, depth);
        this.handleUpdate(data);
    }

    printCheckbox(node) {
        const { isCheckable, keywordLabel, depth } = this.props;

        if (isCheckable(node, depth)) {
            return (
                <input
                    type="checkbox"
                    name={node[keywordLabel || 0]}
                    onChange={e => {
                        this.handleCheckToggle(node, e);
                    }}
                    checked={!!node.isChecked}
                    id={node.id}
                />
            );
        }
    }

    printDeleteButton(node) {
        const { isDeletable, depth, deleteElement } = this.props;

        if (!isDeletable || isDeletable(node, depth)) {
            return (
                <div
                    className="delete-btn"
                    onClick={() => {
                        this.handleDelete(node);
                    }}
                >
                    {deleteElement}
                </div>
            );
        }
    }

    printExpandButton(node) {
        const className = node.isExpanded
            ? "super-treeview-triangle-btn-down"
            : "super-treeview-triangle-btn-right";
        const { isExpandable, depth } = this.props;

        if (isExpandable && isExpandable(node, depth)) {
            return (
                <div
                    className={`super-treeview-triangle-btn ${className}`}
                    onClick={() => {
                        this.handleExpandToggle(node);
                    }}
                />
            );
        } else {
            return (
                <div
                    className={`super-treeview-triangle-btn super-treeview-triangle-btn-none`}
                />
            );
        }
    }

    printNoChildrenMessage() {
        const {
            transitionExitTimeout,
            noChildrenAvailableMessage
        } = this.props;
        const noChildrenTransitionProps = {
            classNames: "super-treeview-no-children-transition",
            key: "super-treeview-no-children",
            style: {
                transitionDuration: `${transitionExitTimeout}ms`,
                transitionDelay: `${transitionExitTimeout}ms`
            },
            timeout: {
                enter: transitionExitTimeout
            },
            exit: false
        };

        return (
            <CSSTransition {...noChildrenTransitionProps}>
                <div className="super-treeview-no-children">
                    <div className="super-treeview-no-children-content">
                        {noChildrenAvailableMessage}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    printNodes(nodeArray) {
        const { getStyleClassCb } = this.props;
        const {
            keywordKey,
            keywordLabel,
            depth,
            transitionEnterTimeout,
            transitionExitTimeout
        } = this.state;
        const {
            printExpandButton,
            printCheckbox,
            printDeleteButton,
            printChildren
        } = this;

        const nodeTransitionProps = {
            classNames: "super-treeview-node-transition",
            style: {
                transitionDuration: `${transitionEnterTimeout}ms`
            },
            timeout: {
                enter: transitionEnterTimeout,
                exit: transitionExitTimeout
            }
        };

        return (
            <TransitionGroup>
                {nodeArray.length === 0
                    ? this.printNoChildrenMessage()
                    : nodeArray.map((node, index) => {
                          const nodeText = node[keywordLabel] || "";
                          return (
                              <CSSTransition
                                  {...nodeTransitionProps}
                                  key={node[keywordKey] || index}
                              >
                                  <div
                                      className={
                                          "super-treeview-node" +
                                          (getStyleClassCb
                                              ? getStyleClassCb(node)
                                              : "")
                                      }
                                  >
                                      <div className="super-treeview-node-content">
                                          {printExpandButton(node)}
                                          {printCheckbox(node)}
                                          <label
                                              htmlFor={node.id}
                                              title={nodeText}
                                              className="super-treeview-text"
                                          >
                                              {nodeText}
                                          </label>
                                          {printDeleteButton(node)}
                                      </div>
                                      {printChildren(node)}
                                  </div>
                              </CSSTransition>
                          );
                      })}
            </TransitionGroup>
        );
    }

    printChildren(node) {
        if (!node.isExpanded) {
            return null;
        }

        const { keywordChildren, keywordChildrenLoading, depth } = this.state;
        const isChildrenLoading = node[keywordChildrenLoading] || false
        let childrenElement;

        if (isChildrenLoading) {
            childrenElement = this.props.loadingElement
        } else {
            childrenElement = (
                <SuperTreeview
                    {...this.props}
                    data={node[keywordChildren] || []}
                    depth={depth + 1}
                    onUpdateCb={onChildrenUpdateCb.bind(this)}
                />
            );
        }

        return (
            <div className="super-treeview-children-container">
                {childrenElement}
            </div>
        );

        function onChildrenUpdateCb(updatedData) {
            const data = deepClone(this.state.data);
            const currentNode = find(data, node);

            currentNode[keywordChildren] = updatedData;
            this.handleUpdate(data);
        }
    }

    render() {
        const { data } = this.state;

        return <div className="super-treeview">{this.printNodes(data)}</div>;
    }
}

export default SuperTreeview;
