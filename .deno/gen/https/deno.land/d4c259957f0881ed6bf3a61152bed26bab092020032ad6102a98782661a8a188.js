import { escapeToBuffer } from '../../utils/html.ts';
const emptyTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];
const booleanAttributes = [
    'allowfullscreen',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'inert',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
];
const childrenToStringToBuffer = (children, buffer)=>{
    for(let i = 0, len = children.length; i < len; i++){
        const child = children[i];
        if (typeof child === 'string') {
            escapeToBuffer(child, buffer);
        } else if (typeof child === 'boolean' || child === null || child === undefined) {
            continue;
        } else if (child instanceof JSXNode) {
            child.toStringToBuffer(buffer);
        } else if (typeof child === 'number' || child.isEscaped) {
            buffer[0] += child;
        } else {
            // `child` type is `Child[]`, so stringify recursively
            childrenToStringToBuffer(child, buffer);
        }
    }
};
export class JSXNode {
    tag;
    props;
    children;
    isEscaped = true;
    constructor(tag, props, children){
        this.tag = tag;
        this.props = props;
        this.children = children;
    }
    toString() {
        const buffer = [
            ''
        ];
        this.toStringToBuffer(buffer);
        return buffer[0];
    }
    toStringToBuffer(buffer) {
        const tag = this.tag;
        const props = this.props;
        let { children  } = this;
        buffer[0] += `<${tag}`;
        const propsKeys = Object.keys(props || {});
        for(let i = 0, len = propsKeys.length; i < len; i++){
            const v = props[propsKeys[i]];
            if (typeof v === 'string') {
                buffer[0] += ` ${propsKeys[i]}="`;
                escapeToBuffer(v, buffer);
                buffer[0] += '"';
            } else if (typeof v === 'number') {
                buffer[0] += ` ${propsKeys[i]}="${v}"`;
            } else if (v === null || v === undefined) {
            // Do nothing
            } else if (typeof v === 'boolean' && booleanAttributes.includes(propsKeys[i])) {
                if (v) {
                    buffer[0] += ` ${propsKeys[i]}=""`;
                }
            } else if (propsKeys[i] === 'dangerouslySetInnerHTML') {
                if (children.length > 0) {
                    throw 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.';
                }
                const escapedString = new String(v.__html);
                escapedString.isEscaped = true;
                children = [
                    escapedString
                ];
            } else {
                buffer[0] += ` ${propsKeys[i]}="`;
                escapeToBuffer(v.toString(), buffer);
                buffer[0] += '"';
            }
        }
        if (emptyTags.includes(tag)) {
            buffer[0] += '/>';
            return;
        }
        buffer[0] += '>';
        childrenToStringToBuffer(children, buffer);
        buffer[0] += `</${tag}>`;
    }
}
class JSXFunctionNode extends JSXNode {
    toStringToBuffer(buffer) {
        const { children  } = this;
        const res = this.tag.call(null, {
            ...this.props,
            children: children.length <= 1 ? children[0] : children
        });
        if (res instanceof JSXNode) {
            res.toStringToBuffer(buffer);
        } else if (typeof res === 'number' || res.isEscaped) {
            buffer[0] += res;
        } else {
            escapeToBuffer(res, buffer);
        }
    }
}
class JSXFragmentNode extends JSXNode {
    toStringToBuffer(buffer) {
        childrenToStringToBuffer(this.children, buffer);
    }
}
export { jsxFn as jsx };
const jsxFn = (tag, props, ...children)=>{
    if (typeof tag === 'function') {
        return new JSXFunctionNode(tag, props, children);
    } else {
        return new JSXNode(tag, props, children);
    }
};
const shallowEqual = (a, b)=>{
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for(let i = 0, len = aKeys.length; i < len; i++){
        if (a[aKeys[i]] !== b[aKeys[i]]) {
            return false;
        }
    }
    return true;
};
export const memo = (component, propsAreEqual = shallowEqual)=>{
    let computed = undefined;
    let prevProps = undefined;
    return (props)=>{
        if (prevProps && !propsAreEqual(prevProps, props)) {
            computed = undefined;
        }
        prevProps = props;
        return computed ||= component(props);
    };
};
export const Fragment = (props)=>{
    return new JSXFragmentNode('', {}, props.children || []);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvbWlkZGxld2FyZS9qc3gvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXNjYXBlVG9CdWZmZXIgfSBmcm9tICcuLi8uLi91dGlscy9odG1sLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdHJpbmdCdWZmZXIsIEh0bWxFc2NhcGVkLCBIdG1sRXNjYXBlZFN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL2h0bWwudHMnXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG50eXBlIFByb3BzID0gUmVjb3JkPHN0cmluZywgYW55PlxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gIG5hbWVzcGFjZSBKU1gge1xuICAgIHR5cGUgRWxlbWVudCA9IEh0bWxFc2NhcGVkU3RyaW5nXG4gICAgaW50ZXJmYWNlIEludHJpbnNpY0VsZW1lbnRzIHtcbiAgICAgIFt0YWdOYW1lOiBzdHJpbmddOiBQcm9wc1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBlbXB0eVRhZ3MgPSBbXG4gICdhcmVhJyxcbiAgJ2Jhc2UnLFxuICAnYnInLFxuICAnY29sJyxcbiAgJ2VtYmVkJyxcbiAgJ2hyJyxcbiAgJ2ltZycsXG4gICdpbnB1dCcsXG4gICdrZXlnZW4nLFxuICAnbGluaycsXG4gICdtZXRhJyxcbiAgJ3BhcmFtJyxcbiAgJ3NvdXJjZScsXG4gICd0cmFjaycsXG4gICd3YnInLFxuXVxuY29uc3QgYm9vbGVhbkF0dHJpYnV0ZXMgPSBbXG4gICdhbGxvd2Z1bGxzY3JlZW4nLFxuICAnYXN5bmMnLFxuICAnYXV0b2ZvY3VzJyxcbiAgJ2F1dG9wbGF5JyxcbiAgJ2NoZWNrZWQnLFxuICAnY29udHJvbHMnLFxuICAnZGVmYXVsdCcsXG4gICdkZWZlcicsXG4gICdkaXNhYmxlZCcsXG4gICdmb3Jtbm92YWxpZGF0ZScsXG4gICdoaWRkZW4nLFxuICAnaW5lcnQnLFxuICAnaXNtYXAnLFxuICAnaXRlbXNjb3BlJyxcbiAgJ2xvb3AnLFxuICAnbXVsdGlwbGUnLFxuICAnbXV0ZWQnLFxuICAnbm9tb2R1bGUnLFxuICAnbm92YWxpZGF0ZScsXG4gICdvcGVuJyxcbiAgJ3BsYXlzaW5saW5lJyxcbiAgJ3JlYWRvbmx5JyxcbiAgJ3JlcXVpcmVkJyxcbiAgJ3JldmVyc2VkJyxcbiAgJ3NlbGVjdGVkJyxcbl1cblxuY29uc3QgY2hpbGRyZW5Ub1N0cmluZ1RvQnVmZmVyID0gKGNoaWxkcmVuOiBDaGlsZFtdLCBidWZmZXI6IFN0cmluZ0J1ZmZlcik6IHZvaWQgPT4ge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVzY2FwZVRvQnVmZmVyKGNoaWxkLCBidWZmZXIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgY2hpbGQgPT09ICdib29sZWFuJyB8fCBjaGlsZCA9PT0gbnVsbCB8fCBjaGlsZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250aW51ZVxuICAgIH0gZWxzZSBpZiAoY2hpbGQgaW5zdGFuY2VvZiBKU1hOb2RlKSB7XG4gICAgICBjaGlsZC50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIGNoaWxkID09PSAnbnVtYmVyJyB8fFxuICAgICAgKGNoaWxkIGFzIHVua25vd24gYXMgeyBpc0VzY2FwZWQ6IGJvb2xlYW4gfSkuaXNFc2NhcGVkXG4gICAgKSB7XG4gICAgICBidWZmZXJbMF0gKz0gY2hpbGRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYGNoaWxkYCB0eXBlIGlzIGBDaGlsZFtdYCwgc28gc3RyaW5naWZ5IHJlY3Vyc2l2ZWx5XG4gICAgICBjaGlsZHJlblRvU3RyaW5nVG9CdWZmZXIoY2hpbGQsIGJ1ZmZlcilcbiAgICB9XG4gIH1cbn1cblxudHlwZSBDaGlsZCA9IHN0cmluZyB8IG51bWJlciB8IEpTWE5vZGUgfCBDaGlsZFtdXG5leHBvcnQgY2xhc3MgSlNYTm9kZSBpbXBsZW1lbnRzIEh0bWxFc2NhcGVkIHtcbiAgdGFnOiBzdHJpbmcgfCBGdW5jdGlvblxuICBwcm9wczogUHJvcHNcbiAgY2hpbGRyZW46IENoaWxkW11cbiAgaXNFc2NhcGVkOiB0cnVlID0gdHJ1ZVxuICBjb25zdHJ1Y3Rvcih0YWc6IHN0cmluZyB8IEZ1bmN0aW9uLCBwcm9wczogUHJvcHMsIGNoaWxkcmVuOiBDaGlsZFtdKSB7XG4gICAgdGhpcy50YWcgPSB0YWdcbiAgICB0aGlzLnByb3BzID0gcHJvcHNcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW5cbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnVmZmVyOiBTdHJpbmdCdWZmZXIgPSBbJyddXG4gICAgdGhpcy50b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcilcbiAgICByZXR1cm4gYnVmZmVyWzBdXG4gIH1cblxuICB0b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCB7XG4gICAgY29uc3QgdGFnID0gdGhpcy50YWcgYXMgc3RyaW5nXG4gICAgY29uc3QgcHJvcHMgPSB0aGlzLnByb3BzXG4gICAgbGV0IHsgY2hpbGRyZW4gfSA9IHRoaXNcblxuICAgIGJ1ZmZlclswXSArPSBgPCR7dGFnfWBcblxuICAgIGNvbnN0IHByb3BzS2V5cyA9IE9iamVjdC5rZXlzKHByb3BzIHx8IHt9KVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHByb3BzS2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29uc3QgdiA9IHByb3BzW3Byb3BzS2V5c1tpXV1cbiAgICAgIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtwcm9wc0tleXNbaV19PVwiYFxuICAgICAgICBlc2NhcGVUb0J1ZmZlcih2LCBidWZmZXIpXG4gICAgICAgIGJ1ZmZlclswXSArPSAnXCInXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICBidWZmZXJbMF0gKz0gYCAke3Byb3BzS2V5c1tpXX09XCIke3Z9XCJgXG4gICAgICB9IGVsc2UgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmdcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJyAmJiBib29sZWFuQXR0cmlidXRlcy5pbmNsdWRlcyhwcm9wc0tleXNbaV0pKSB7XG4gICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgYnVmZmVyWzBdICs9IGAgJHtwcm9wc0tleXNbaV19PVwiXCJgXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJvcHNLZXlzW2ldID09PSAnZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwnKSB7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgdGhyb3cgJ0NhbiBvbmx5IHNldCBvbmUgb2YgYGNoaWxkcmVuYCBvciBgcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxgLidcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVzY2FwZWRTdHJpbmcgPSBuZXcgU3RyaW5nKHYuX19odG1sKSBhcyBIdG1sRXNjYXBlZFN0cmluZ1xuICAgICAgICBlc2NhcGVkU3RyaW5nLmlzRXNjYXBlZCA9IHRydWVcbiAgICAgICAgY2hpbGRyZW4gPSBbZXNjYXBlZFN0cmluZ11cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1ZmZlclswXSArPSBgICR7cHJvcHNLZXlzW2ldfT1cImBcbiAgICAgICAgZXNjYXBlVG9CdWZmZXIodi50b1N0cmluZygpLCBidWZmZXIpXG4gICAgICAgIGJ1ZmZlclswXSArPSAnXCInXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVtcHR5VGFncy5pbmNsdWRlcyh0YWcgYXMgc3RyaW5nKSkge1xuICAgICAgYnVmZmVyWzBdICs9ICcvPidcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGJ1ZmZlclswXSArPSAnPidcblxuICAgIGNoaWxkcmVuVG9TdHJpbmdUb0J1ZmZlcihjaGlsZHJlbiwgYnVmZmVyKVxuXG4gICAgYnVmZmVyWzBdICs9IGA8LyR7dGFnfT5gXG4gIH1cbn1cblxuY2xhc3MgSlNYRnVuY3Rpb25Ob2RlIGV4dGVuZHMgSlNYTm9kZSB7XG4gIHRvU3RyaW5nVG9CdWZmZXIoYnVmZmVyOiBTdHJpbmdCdWZmZXIpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSB0aGlzXG5cbiAgICBjb25zdCByZXMgPSAodGhpcy50YWcgYXMgRnVuY3Rpb24pLmNhbGwobnVsbCwge1xuICAgICAgLi4udGhpcy5wcm9wcyxcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbi5sZW5ndGggPD0gMSA/IGNoaWxkcmVuWzBdIDogY2hpbGRyZW4sXG4gICAgfSlcblxuICAgIGlmIChyZXMgaW5zdGFuY2VvZiBKU1hOb2RlKSB7XG4gICAgICByZXMudG9TdHJpbmdUb0J1ZmZlcihidWZmZXIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVzID09PSAnbnVtYmVyJyB8fCAocmVzIGFzIEh0bWxFc2NhcGVkKS5pc0VzY2FwZWQpIHtcbiAgICAgIGJ1ZmZlclswXSArPSByZXNcbiAgICB9IGVsc2Uge1xuICAgICAgZXNjYXBlVG9CdWZmZXIocmVzLCBidWZmZXIpXG4gICAgfVxuICB9XG59XG5cbmNsYXNzIEpTWEZyYWdtZW50Tm9kZSBleHRlbmRzIEpTWE5vZGUge1xuICB0b1N0cmluZ1RvQnVmZmVyKGJ1ZmZlcjogU3RyaW5nQnVmZmVyKTogdm9pZCB7XG4gICAgY2hpbGRyZW5Ub1N0cmluZ1RvQnVmZmVyKHRoaXMuY2hpbGRyZW4sIGJ1ZmZlcilcbiAgfVxufVxuXG5leHBvcnQgeyBqc3hGbiBhcyBqc3ggfVxuY29uc3QganN4Rm4gPSAoXG4gIHRhZzogc3RyaW5nIHwgRnVuY3Rpb24sXG4gIHByb3BzOiBQcm9wcyxcbiAgLi4uY2hpbGRyZW46IChzdHJpbmcgfCBIdG1sRXNjYXBlZFN0cmluZylbXVxuKTogSlNYTm9kZSA9PiB7XG4gIGlmICh0eXBlb2YgdGFnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBKU1hGdW5jdGlvbk5vZGUodGFnLCBwcm9wcywgY2hpbGRyZW4pXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBKU1hOb2RlKHRhZywgcHJvcHMsIGNoaWxkcmVuKVxuICB9XG59XG5cbnR5cGUgRkM8VCA9IFByb3BzPiA9IChwcm9wczogVCkgPT4gSHRtbEVzY2FwZWRTdHJpbmdcblxuY29uc3Qgc2hhbGxvd0VxdWFsID0gKGE6IFByb3BzLCBiOiBQcm9wcyk6IGJvb2xlYW4gPT4ge1xuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKGEpXG4gIGNvbnN0IGJLZXlzID0gT2JqZWN0LmtleXMoYilcbiAgaWYgKGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gYUtleXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoYVthS2V5c1tpXV0gIT09IGJbYUtleXNbaV1dKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgbWVtbyA9IDxUPihcbiAgY29tcG9uZW50OiBGQzxUPixcbiAgcHJvcHNBcmVFcXVhbDogKHByZXZQcm9wczogUmVhZG9ubHk8VD4sIG5leHRQcm9wczogUmVhZG9ubHk8VD4pID0+IGJvb2xlYW4gPSBzaGFsbG93RXF1YWxcbik6IEZDPFQ+ID0+IHtcbiAgbGV0IGNvbXB1dGVkID0gdW5kZWZpbmVkXG4gIGxldCBwcmV2UHJvcHM6IFQgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcbiAgcmV0dXJuICgocHJvcHM6IFQpOiBIdG1sRXNjYXBlZFN0cmluZyA9PiB7XG4gICAgaWYgKHByZXZQcm9wcyAmJiAhcHJvcHNBcmVFcXVhbChwcmV2UHJvcHMsIHByb3BzKSkge1xuICAgICAgY29tcHV0ZWQgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgcHJldlByb3BzID0gcHJvcHNcbiAgICByZXR1cm4gKGNvbXB1dGVkIHx8PSBjb21wb25lbnQocHJvcHMpKVxuICB9KSBhcyBGQzxUPlxufVxuXG5leHBvcnQgY29uc3QgRnJhZ21lbnQgPSAocHJvcHM6IHsga2V5Pzogc3RyaW5nOyBjaGlsZHJlbj86IENoaWxkW10gfSk6IEpTWE5vZGUgPT4ge1xuICByZXR1cm4gbmV3IEpTWEZyYWdtZW50Tm9kZSgnJywge30sIHByb3BzLmNoaWxkcmVuIHx8IFtdKVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsY0FBYyxRQUFRLHNCQUFxQjtBQWdCcEQsTUFBTSxZQUFZO0lBQ2hCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBQ0QsTUFBTSxvQkFBb0I7SUFDeEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELE1BQU0sMkJBQTJCLENBQUMsVUFBbUIsU0FBK0I7SUFDbEYsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLFNBQVMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1FBQ25ELE1BQU0sUUFBUSxRQUFRLENBQUMsRUFBRTtRQUN6QixJ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