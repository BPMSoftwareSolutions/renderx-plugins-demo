import{R as i}from"./EventRouter-DUQzZvsb.js";import{c as p}from"./global-CMa2Rm43.js";var a=new Map,y=(o,e)=>{if(e.payload.kind!=="react")return;const t=e.payload.nodeId,c=e.payload.template.react?.code;if(!t||!c){e.logger?.warn?.("renderReact: Missing nodeId or React code");return}try{const n=document.getElementById(t);if(!n)throw new Error(`Container element not found: ${t}`);const r=a.get(t);r&&(r.unmount(),a.delete(t));const d=l(c),u=p.createRoot(n),f=i.createElement(d);u.render(f),a.set(t,u),e.payload.reactRendered=!0}catch(n){const r=n instanceof Error?n.message:String(n);e.logger?.error?.("renderReact error:",r);const d=document.getElementById(t);d&&(d.innerHTML=`
        <div style="
          padding: 8px; 
          background: #fee; 
          border: 1px solid #fcc; 
          border-radius: 4px; 
          color: #c33;
          font-family: monospace;
          font-size: 12px;
        ">
          <strong>React Error:</strong><br>
          ${m(r)}
        </div>
      `),e.payload.reactError=r}};function l(o){const e=`
    "use strict";
    ${o}
    
    // Handle different export patterns
    if (typeof exports !== 'undefined' && exports.default) {
      return exports.default;
    }
    
    // Look for default export function
    const defaultMatch = code.match(/export\\s+default\\s+function\\s+(\\w+)/);
    if (defaultMatch) {
      return eval(defaultMatch[1]);
    }
    
    // Look for arrow function default export
    const arrowMatch = code.match(/export\\s+default\\s+\\(([^)]*)\\)\\s*=>/);
    if (arrowMatch) {
      return eval('(' + code.substring(code.indexOf('(')) + ')');
    }
    
    // Look for any function declaration and use it
    const funcMatch = code.match(/function\\s+(\\w+)/);
    if (funcMatch) {
      return eval(funcMatch[1]);
    }
    
    // Fallback: wrap the entire code as a component
    return function GeneratedComponent() {
      return React.createElement('div', { 
        style: { padding: '8px', color: '#666' } 
      }, 'Component could not be parsed');
    };
  `;try{const c=new Function("React","exports",e)(i,{});if(typeof c!="function")throw new Error("Compiled code did not return a valid React component function");return c}catch(t){return function(){return i.createElement("div",{style:{padding:"8px",background:"#fee",border:"1px solid #fcc",borderRadius:"4px",color:"#c33",fontFamily:"monospace",fontSize:"12px"}},`Compilation Error: ${t instanceof Error?t.message:String(t)}`)}}}function R(o){const e=a.get(o);e&&(e.unmount(),a.delete(o))}function m(o){const e=document.createElement("div");return e.textContent=o,e.innerHTML}export{R as cleanupReactRoot,y as renderReact};
