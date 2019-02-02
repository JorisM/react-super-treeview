// import "./style.scss";
import * as React from "react";
import { isNil, isEmpty, isEqual, find, get, cloneDeep } from "lodash";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { any } from "prop-types";

interface SuperTreeviewProps {
    data: Record<any, any> | Array <Record<any, any>>;
    depth?: number;

    deleteElement?: JSX.Element;

    getStyleClassCb?: (any) => any;

    isCheckable?: (any, depth?: number) => any;
    isDeletable?: (any, depth?: number) => any;
    isExpandable?: (any, depth?: number) => any;

    keywordChildren?: string;
    keywordChildrenLoading?: string;
    keywordKey?: string;
    keywordLabel?: string;

    loadingElement?: JSX.Element;
    noChildrenAvailableMessage?: string;

    onCheckToggleCb?: (any, depth?: number) => any;
    onDeleteCb?: (any, newdata: any, depth?: number) => any;
    onExpandToggleCb?: (any, depth?: number) => any;
    onUpdateCb?: (any, depth?: number) => any;

    transitionEnterTimeout?: number;
    transitionExitTimeout?: number;
}
interface SuperTreeviewState {
    lastCheckToggledNodeIndex: number;

    data: Array<Record<any, any>>;
    depth: number;

    deleteElement: JSX.Element;

    getStyleClassCb: (any) => any;

    isCheckable: (any, depth?: number) => any;
    isDeletable: (any, depth?: number) => any;
    isExpandable: (any, depth?: number) => any;

    keywordChildren: string;
    keywordChildrenLoading: string;
    keywordKey: string;
    keywordLabel: string;

    loadingElement: JSX.Element;
    noChildrenAvailableMessage: string;

    onCheckToggleCb: (any, depth?: number) => any;
    onDeleteCb: (any, newdata: any, depth?: number) => any;
    onExpandToggleCb: (any, depth?: number) => any;
    onUpdateCb: (any, depth?: number) => any;

    transitionEnterTimeout: number;
    transitionExitTimeout: number;
}

class SuperTreeview extends React.Component<
    SuperTreeviewProps,
    SuperTreeviewState
> {
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
    }

    componentWillMount() {
        const {
            data,
            depth,
            deleteElement,
            getStyleClassCb,
            isCheckable,
            keywordChildren,
            isDeletable,
            isExpandable,
            keywordChildrenLoading,
            loadingElement,
            keywordKey,
            keywordLabel,
            noChildrenAvailableMessage,
            onCheckToggleCb,
            onDeleteCb,
            onUpdateCb,
            onExpandToggleCb
        } = this.props;

        this.setState({
            data: data instanceof Array ? data : [data],
            lastCheckToggledNodeIndex: 0,
            depth: depth || 0,
            deleteElement: deleteElement || <div>(X)</div>,
            getStyleClassCb:
                getStyleClassCb ||
                ((/* node, depth */) => {
                    return "";
                }),
            isCheckable:
                isCheckable ||
                ((/* node, depth */) => {
                    return true;
                }),
            isDeletable:
                isDeletable ||
                ((/* node, depth */) => {
                    return true;
                }),
            isExpandable:
                isExpandable ||
                ((/* node, depth */) => {
                    return true;
                }),

            keywordChildren: keywordChildren || "children",
            keywordChildrenLoading:
                keywordChildrenLoading || "isChildrenLoading",
            keywordLabel: keywordLabel || "name",
            keywordKey: keywordKey || "id",

            loadingElement: loadingElement || <div>loading...</div>,

            noChildrenAvailableMessage:
                noChildrenAvailableMessage || "No data found",

            onCheckToggleCb:
                onCheckToggleCb || ((/* Array of nodes, depth */) => {}),
            onDeleteCb:
                onDeleteCb ||
                ((/* node, updatedData, depth */) => {
                    return true;
                }),
            onExpandToggleCb: onExpandToggleCb || ((/* node, depth */) => {}),
            onUpdateCb: onUpdateCb || ((/* updatedData, depth */) => {})
        });
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
        const { depth, onUpdateCb } = this.state;

        onUpdateCb(updatedData, depth);
    }

    handleCheckToggle(node: any, e) {
        const { onCheckToggleCb, depth } = this.state;
        const { lastCheckToggledNodeIndex, data } = this.state;
        const currentNode = find(data, node);
        const currentNodeIndex = data.indexOf(currentNode);
        const getToggledNodes = () => {
            if (e.shiftKey && !isNil(lastCheckToggledNodeIndex)) {
                const rangeStart = Math.min(
                    currentNodeIndex,
                    lastCheckToggledNodeIndex
                );
                const rangeEnd = Math.max(
                    currentNodeIndex,
                    lastCheckToggledNodeIndex
                );

                const nodeRange = data.slice(rangeStart, rangeEnd + 1);

                return nodeRange.map(node => {
                    node.isChecked = e.target.checked;
                    return node;
                });
            } else {
                currentNode.isChecked = e.target.checked;
                return [currentNode];
            }
        };

        onCheckToggleCb(getToggledNodes(), depth);
        this.setState({ lastCheckToggledNodeIndex: currentNodeIndex });
        this.handleUpdate(data);
    }

    handleDelete(node) {
        const { onDeleteCb, depth } = this.state;
        const data = cloneDeep(this.state.data);

        const newData = data.filter(nodeItem => {
            return !isEqual(node, nodeItem);
        });

        onDeleteCb(node, newData, depth) && this.handleUpdate(newData);
    }

    handleExpandToggle(node) {
        const { onExpandToggleCb, depth } = this.state;
        const data = cloneDeep(this.state.data);
        const currentNode = find(data, node);

        currentNode.isExpanded = !currentNode.isExpanded;

        onExpandToggleCb(currentNode, depth);
        this.handleUpdate(data);
    }

    printCheckbox(node) {
        const { isCheckable, keywordLabel, depth } = this.state;

        if (isCheckable(node, depth)) {
            return (
                <input
                    type="checkbox"
                    name={node[keywordLabel]}
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
        const { isDeletable, depth, deleteElement } = this.state;

        if (isDeletable(node, depth)) {
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
        const { isExpandable, depth } = this.state;

        if (isExpandable(node, depth)) {
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
        console.log(nodeArray);
        const {
            keywordKey,
            keywordLabel,
            depth,
            transitionEnterTimeout,
            transitionExitTimeout,
            getStyleClassCb
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
                {isEmpty(nodeArray)
                    ? this.printNoChildrenMessage()
                    : nodeArray.map((node, index) => {
                          const nodeText = get(node, keywordLabel, "");
                          return (
                              <CSSTransition
                                  {...nodeTransitionProps}
                                  key={node[keywordKey] || index}
                              >
                                  <div
                                      className={
                                          "super-treeview-node" +
                                          getStyleClassCb(node)
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
        const isChildrenLoading = get(node, keywordChildrenLoading, false);
        let childrenElement;

        if (isChildrenLoading) {
            childrenElement = get(this.props, "loadingElement");
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
            const data = cloneDeep(this.state.data);
            const currentNode = find(data, node);

            currentNode[keywordChildren] = updatedData;
            this.handleUpdate(data);
        }
    }

    render() {
        return (
            <div className="super-treeview">
                {this.printNodes(this.state.data)}
            </div>
        );
    }
}

export default SuperTreeview;
