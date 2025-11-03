import{c as ne}from"./component-mapper-Dsg136Sp.js";import{j as a,E as U,R as I,a as j}from"./EventRouter-DUQzZvsb.js";import{r as H}from"./interactionManifest-BORsh5a3.js";import{u as te}from"./Header-A6BR6KQZ-DYj0DEFE.js";import{i as ae}from"./feature-flags-IuyZAa4_.js";function oe(e){const n=e?.metadata?.type||e?.metadata?.replaces||"div",t=e?.metadata?.name||n,o=["rx-comp",`rx-${n}`],s=e?.integration?.canvasIntegration||{},r=e?.ui?.icon||{},i={};r?.mode==="emoji"&&r?.value&&(i["data-icon"]=String(r.value),r.position&&(i["data-icon-pos"]=String(r.position)));const c=e?.metadata?.category||"basic",d=e?.metadata?.description||`${t} component`;i["data-category"]=String(c),i["data-description"]=String(d);const l=e?.integration?.canvasIntegration?.overlayKind;l&&(i["data-overlay"]=String(l)),!!e?.integration?.canvasIntegration?.allowChildElements&&(i["data-role"]="container");const p=ne(e)||String(n),f=(e?.ui?.tools||{})?.resize||{};f?.enabled===!1&&(i["data-resize-enabled"]="false");const x=Array.isArray(f?.handles)?f.handles.filter(k=>typeof k=="string"):[];x.length&&(i["data-resize-handles"]=x.join(","));const m=f?.constraints?.min?.w??e?.integration?.canvasIntegration?.minWidth,v=f?.constraints?.min?.h??e?.integration?.canvasIntegration?.minHeight;m!=null&&(i["data-resize-min-w"]=String(m)),v!=null&&(i["data-resize-min-h"]=String(v));const b=e?.integration?.properties?.defaultValues||{};return{tag:p,text:n==="button"?b?.content||"Click Me":n==="heading"?b?.content||"Heading Text":n==="paragraph"?b?.content||"This is a paragraph of text.":void 0,classes:o,css:e?.ui?.styles?.css,cssVariables:e?.ui?.styles?.variables||{},cssLibrary:e?.ui?.styles?.library?.css,cssVariablesLibrary:e?.ui?.styles?.library?.variables||{},attributes:{...i,...n==="image"?{src:String(b?.src||"https://via.placeholder.com/300x200?text=Image"),alt:String(b?.alt||"Image description"),...b?.loading?{loading:String(b.loading)}:{}}:{}},...b&&Object.keys(b).length?{content:b}:{},dimensions:{width:s.defaultWidth,height:s.defaultHeight},style:{...n==="image"&&b?.objectFit?{objectFit:String(b.objectFit)}:{}}}}function _(e){if(typeof window>"u")return;const n=window.RenderX?.config;if(!n){console.warn("Host config not available. Ensure the host has called initConfig().");return}const t=n.getValue;if(typeof t=="function")return t.call(n,e)}function se(e){if(typeof window>"u")return!1;const n=window.RenderX?.config;if(!n)return console.warn("Host config not available. Ensure the host has called initConfig()."),!1;const t=n.hasValue;return typeof t!="function"?!1:t.call(n,e)}var P="renderx:custom-components",O=10,q=1;function re(e){const n=Date.now(),t=Math.random().toString(36).substring(2,8);return`custom-${e}-${n}-${t}`}function $(){try{const e=localStorage.getItem(P);return e?new Blob([e]).size/(1024*1024):0}catch{return 0}}function ie(e){const n=e/1048576;return n>q?!1:$()+n<=O}async function G(e,n){try{if(!e?.metadata?.type||!e?.metadata?.name)return{success:!1,error:"Component must have metadata.type and metadata.name"};const t=JSON.stringify(e),o=new Blob([t]).size;if(!ie(o)){const d=(o/1048576).toFixed(2);return o>q*1024*1024?{success:!1,error:`Component too large (${d}MB). Maximum size is ${q}MB.`}:{success:!1,error:`Storage quota exceeded. Current usage: ${$().toFixed(2)}MB, Maximum: ${O}MB.`}}const s=M();if(s.find(d=>d.component.metadata.type===e.metadata.type))return{success:!1,error:`Component with type "${e.metadata.type}" already exists. Remove it first or use a different type.`};const i={id:re(e.metadata.type),uploadedAt:new Date().toISOString(),source:"user-upload",originalFilename:n,component:{...e,metadata:{...e.metadata,category:e.metadata.category||"custom"}}},c=[...s,i];return localStorage.setItem(P,JSON.stringify(c)),{success:!0,component:i}}catch(t){return{success:!1,error:`Failed to save component: ${t instanceof Error?t.message:"Unknown error"}`}}}function M(){try{const e=localStorage.getItem(P);if(!e)return[];const n=JSON.parse(e);return Array.isArray(n)?n:[]}catch{return[]}}function ce(e){try{const n=M(),t=n.filter(o=>o.id!==e);return t.length===n.length?!1:(localStorage.setItem(P,JSON.stringify(t)),!0)}catch{return!1}}function le(){const e=M(),n=$();return{currentSizeMB:Math.round(n*100)/100,maxSizeMB:O,componentCount:e.length,availableMB:Math.round((O-n)*100)/100}}function D(e){const n=oe(e),t=e?.metadata?.replaces||e?.metadata?.type||"div";return{id:`json-${t}`,name:e?.metadata?.name||t,template:n,metadata:e?.metadata||{},ui:e?.ui}}var de={async loadComponents(e,n){let t=[];try{const s=M().map(c=>D(c.component)),r=typeof globalThis<"u"?globalThis:window,i=r?.window?.RenderX?.inventory||r?.RenderX?.inventory;if(i&&typeof i.listComponents=="function"){const d=(await i.listComponents()||[]).map(D);t=[...s,...d]}else if(typeof fetch=="function"){const c=await fetch("/json-components/index.json"),l=(c.ok?await c.json():{components:[]})?.components||[],u="/json-components/",p=[];for(const h of l){const f=await fetch(u+h);if(f.ok){const x=await f.json();p.push(D(x))}}t=[...s,...p]}else t=s}catch{}return n.payload.components=Array.isArray(t)?t:[],{count:n.payload.components.length}},notifyUi(e,n){e?.onComponentsLoaded?.(n.payload.components)}};function pe(e){const n=e&&e.template||{},t=typeof n.tag=="string"&&n.tag?n.tag:"div",o=Array.isArray(n.classes)?n.classes.filter(h=>typeof h=="string"):[],s=typeof n.text=="string"?n.text:void 0,r=typeof n.css=="string"&&n.css.trim()?n.css:void 0,i=n.attributes&&typeof n.attributes=="object"?n.attributes:void 0,c=typeof n.cssLibrary=="string"&&n.cssLibrary.trim()?n.cssLibrary:void 0,d=n.cssVariables&&typeof n.cssVariables=="object"?n.cssVariables:{},l=n.cssVariablesLibrary&&typeof n.cssVariablesLibrary=="object"?n.cssVariablesLibrary:{},u={...d,...l},p={};for(const[h,f]of Object.entries(u)){const x=String(h).startsWith("--")?String(h):`--${h}`;p[x]=String(f)}return{tag:t,classes:o,text:s,cssText:r,cssTextLibrary:c,cssVars:p,attributes:i}}function me(e){const n={};if(!e)return n;for(const[t,o]of Object.entries(e))n[t]=o;return n}function ue(e){const n={};for(const[t,o]of Object.entries(e||{}))t.startsWith("data-")&&(n[t]=o);return n}function ge(e){const n=["custom","basic","layout","form","ui"],t={};return n.forEach(o=>{e[o]&&(t[o]=e[o])}),Object.keys(e).forEach(o=>{t[o]||(t[o]=e[o])}),t}function he(e){const n={};return e.forEach(t=>{const o=t?.template?.attributes?.["data-category"]||t?.metadata?.category||"basic";n[o]||(n[o]=[]),n[o].push(t)}),ge(n)}function fe(e){return{custom:"Custom Components",basic:"Basic Components",layout:"Layout Components",form:"Form Components",ui:"UI Components"}[e]||e.charAt(0).toUpperCase()+e.slice(1)+" Components"}function T(e,{insertAt:n}={}){if(!e||typeof document>"u")return;const t=document.head||document.getElementsByTagName("head")[0],o=document.createElement("style");o.type="text/css",n==="top"&&t.firstChild?t.insertBefore(o,t.firstChild):t.appendChild(o),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(document.createTextNode(e))}T(`.library-sidebar {
  width: 320px;
  background: var(--panel-bg);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px var(--panel-shadow);
  height: 100%;
}
.library-sidebar-header {
  padding: 20px;
  background: var(--panel-header-bg);
  color: var(--panel-header-color);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.library-header-content {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.library-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.library-sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  margin: 0;
}
.library-sidebar-subtitle {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
}
.library-component-library {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.library-component-category {
  margin-bottom: 24px;
}
.library-category-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted-text);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.library-component-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.library-component-item {
  cursor: grab;
  background: var(--panel-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.library-component-item:hover {
  border-color: var(--accent-border);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--panel-shadow);
}
.library-component-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}
.library-component-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--panel-header-color);
  margin-bottom: 4px;
}
.library-component-description {
  font-size: 10px;
  color: var(--muted-text);
  line-height: 1.3;
}
.custom-component-upload {
  margin-bottom: 16px;
}
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--panel-bg);
  position: relative;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-zone:hover {
  border-color: var(--accent-border);
  background: var(--panel-header-bg);
}
.upload-zone.drag-over {
  border-color: var(--accent-border);
  background: var(--panel-header-bg);
  transform: scale(1.02);
}
.upload-zone.loading {
  cursor: not-allowed;
  opacity: 0.7;
}
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.upload-icon {
  font-size: 24px;
  display: block;
}
.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.upload-primary {
  font-size: 12px;
  font-weight: 500;
  color: var(--panel-header-color);
}
.upload-secondary {
  font-size: 10px;
  color: var(--muted-text);
}
.upload-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.upload-error {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff3b30;
}
.upload-success {
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
  color: #34c759;
}
.message-icon {
  font-size: 12px;
}
.message-text {
  flex: 1;
  line-height: 1.3;
}
.custom-component-list {
  margin-bottom: 16px;
}
.custom-component-list.empty {
  margin-bottom: 8px;
}
.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--muted-text);
}
.empty-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}
.empty-text {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
}
.empty-subtext {
  font-size: 10px;
  opacity: 0.8;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}
.list-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.storage-info {
  font-size: 10px;
  color: var(--muted-text);
  opacity: 0.8;
}
.component-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.component-item {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.component-info {
  flex: 1;
  min-width: 0;
}
.component-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
  gap: 8px;
}
.component-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--panel-header-color);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.component-type {
  font-size: 10px;
  color: var(--muted-text);
  background: var(--panel-header-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  flex-shrink: 0;
}
.component-description {
  font-size: 10px;
  color: var(--muted-text);
  line-height: 1.3;
  margin-bottom: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.component-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 9px;
}
.meta-item {
  display: flex;
  gap: 4px;
}
.meta-label {
  color: var(--muted-text);
  opacity: 0.8;
}
.meta-value {
  color: var(--muted-text);
  font-weight: 500;
}
.component-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.remove-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.remove-button:hover:not(:disabled) {
  background: rgba(255, 59, 48, 0.1);
}
.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.storage-warning {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 149, 0, 0.1);
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-radius: 6px;
  font-size: 10px;
  color: #ff9500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.warning-icon {
  font-size: 12px;
  flex-shrink: 0;
}
.warning-text {
  line-height: 1.3;
}
.custom-component-error {
  margin: 16px 0;
  padding: 16px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.error-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}
.error-text {
  flex: 1;
}
.error-title {
  font-size: 12px;
  font-weight: 600;
  color: #ff3b30;
  margin-bottom: 4px;
}
.error-message {
  font-size: 11px;
  color: #ff3b30;
  line-height: 1.4;
  opacity: 0.9;
}
.ai-chat-toggle {
  background:
    linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
.ai-chat-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.ai-chat-toggle:active {
  transform: translateY(0);
}
.ai-unavailable-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  cursor: help;
  transition: all 0.2s ease;
}
.ai-unavailable-hint:hover {
  background: rgba(255, 193, 7, 0.2);
  transform: scale(1.05);
}
.hint-icon {
  font-size: 16px;
  color: #ffc107;
}
`);function xe({component:e,conductor:n}){const t=pe(e),o=ue(t.attributes),s=e?.name||e?.template?.name||"Component",r=e?.template?.attributes?.["data-description"]||e?.metadata?.description||`${s} component`,i=e?.template?.attributes?.["data-icon"]||"🧩",c=d=>{try{U.publish("library.component.drag.start.requested",{event:"library:component:drag:start",domEvent:d,component:e},n)}catch{const l=H("canvas.component.drag.start");n?.play?.(l.pluginId,l.sequenceId,{event:"library:component:drag:start",domEvent:d,component:e})}};return a.jsxs("div",{className:"library-component-item",style:me(t.cssVars),...o,draggable:!0,onDragStart:c,children:[t.cssText&&a.jsx("style",{children:t.cssText}),t.cssTextLibrary&&a.jsx("style",{children:t.cssTextLibrary}),a.jsx("span",{className:"library-component-icon",children:i}),a.jsx("div",{className:"library-component-name",children:s}),a.jsx("div",{className:"library-component-description",children:r})]})}function F(e,n){return typeof e!="string"||!e.trim()?`${n} must be a non-empty string`:null}function be(e,n){return!e||typeof e!="object"||Array.isArray(e)?`${n} must be a valid object`:null}function ye(e){const n=[];if(!e||typeof e!="object")return n.push("metadata is required and must be an object"),n;const t=F(e.type,"metadata.type");t&&n.push(t);const o=F(e.name,"metadata.name");if(o&&n.push(o),e.category!==void 0){const s=F(e.category,"metadata.category");s&&n.push(s)}if(e.description!==void 0){const s=F(e.description,"metadata.description");s&&n.push(s)}return typeof e.type=="string"&&e.type.trim()&&(/^[a-z0-9-]+$/.test(e.type)||n.push('metadata.type should contain only lowercase letters, numbers, and hyphens (e.g., "custom-button")')),n}function ve(e){const n=[];if(!e||typeof e!="object")return n.push("ui is required and must be an object"),n;if(!e.template&&!e.styles&&!e.html&&n.push("ui must contain at least one of: template, styles, or html"),e.template!==void 0){const t=typeof e.template=="string",o=e.template&&typeof e.template=="object"&&!Array.isArray(e.template);!t&&!o&&n.push("ui.template must be either a string (Handlebars template) or an object (JSON structure)")}if(e.styles!==void 0){const t=be(e.styles,"ui.styles");t&&n.push(t)}return n}function W(e){const n=[],t=[];if(!e||typeof e!="object"||Array.isArray(e))return{isValid:!1,errors:["Component must be a valid JSON object"],warnings:[]};const o=ye(e.metadata);n.push(...o);const s=ve(e.ui);n.push(...s);const r=["metadata","ui","integration","interactions","events","properties"],i=Object.keys(e).filter(l=>!r.includes(l));i.length>0&&t.push(`Unknown properties found: ${i.join(", ")}. These will be preserved but may not be used.`),e.metadata?.category&&e.metadata.category!=="custom"&&t.push(`metadata.category is "${e.metadata.category}" but will be treated as "custom" in the library`);const c=n.length===0,d={isValid:c,errors:n,warnings:t};return c&&(d.normalizedComponent=we(e)),d}function we(e){return{metadata:{type:e.metadata.type.trim(),name:e.metadata.name.trim(),category:e.metadata.category?.trim()||"custom",description:e.metadata.description?.trim()||`${e.metadata.name} component`},ui:e.ui,...Object.keys(e).filter(n=>!["metadata","ui"].includes(n)).reduce((n,t)=>({...n,[t]:e[t]}),{})}}function je(e){try{const n=JSON.parse(e);return W(n)}catch(n){return{isValid:!1,errors:[`Invalid JSON format: ${n instanceof Error?n.message:"Unknown parsing error"}`],warnings:[]}}}function Ce(e){const n=[],t=[];e.name.toLowerCase().endsWith(".json")||n.push("File must have a .json extension");const o=1024*1024;if(e.size>o){const s=(e.size/1048576).toFixed(2);n.push(`File too large (${s}MB). Maximum size is 1MB.`)}return e.type&&!e.type.includes("json")&&!e.type.includes("text")&&t.push(`File MIME type is "${e.type}". Expected JSON or text file.`),{isValid:n.length===0,errors:n,warnings:t}}function Se({onUpload:e,onComponentAdded:n}){const[t,o]=j.useState(!1),[s,r]=j.useState(!1),[i,c]=j.useState(null),[d,l]=j.useState(null),u=j.useRef(null),p=()=>{c(null),l(null)},h=async y=>{p(),r(!0);try{const w=Ce(y);if(!w.isValid){c(w.errors.join(", ")),e?.(!1,w.errors.join(", "));return}w.warnings.length>0&&console.warn("File validation warnings:",w.warnings);const N=await f(y),g=je(N);if(!g.isValid){c(g.errors.join(", ")),e?.(!1,g.errors.join(", "));return}g.warnings.length>0&&console.warn("Component validation warnings:",g.warnings);const C=await G(g.normalizedComponent,y.name);C.success?(l(`Component "${C.component.component.metadata.name}" uploaded successfully!`),e?.(!0,"Component uploaded successfully!"),n?.()):(c(C.error),e?.(!1,C.error))}catch(w){const N=w instanceof Error?w.message:"Unknown error occurred";c(`Failed to process file: ${N}`),e?.(!1,N)}finally{r(!1)}},f=y=>new Promise((w,N)=>{const g=new FileReader;g.onload=C=>{typeof C.target?.result=="string"?w(C.target.result):N(new Error("Failed to read file as text"))},g.onerror=()=>N(new Error("Failed to read file")),g.readAsText(y)}),x=y=>{y.preventDefault(),y.stopPropagation(),o(!0)},m=y=>{y.preventDefault(),y.stopPropagation(),o(!1)},v=y=>{y.preventDefault(),y.stopPropagation(),o(!1);const w=Array.from(y.dataTransfer.files);if(w.length!==0){if(w.length>1){c("Please upload only one file at a time");return}h(w[0])}},b=y=>{const w=y.target.files;!w||w.length===0||(h(w[0]),u.current&&(u.current.value=""))},k=()=>{s||u.current?.click()};return a.jsxs("div",{className:"custom-component-upload",children:[a.jsxs("div",{className:`upload-zone ${t?"drag-over":""} ${s?"loading":""}`,onDragOver:x,onDragLeave:m,onDrop:v,onClick:k,role:"button",tabIndex:0,onKeyDown:y=>{(y.key==="Enter"||y.key===" ")&&(y.preventDefault(),k())},children:[a.jsx("input",{ref:u,type:"file",accept:".json",onChange:b,style:{display:"none"},disabled:s}),a.jsxs("div",{className:"upload-content",children:[a.jsx("span",{className:"upload-icon",children:s?"⏳":"📁"}),a.jsx("div",{className:"upload-text",children:s?"Processing...":a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"upload-primary",children:"Drop .json file or click to browse"}),a.jsx("div",{className:"upload-secondary",children:"Maximum file size: 1MB"})]})})]})]}),i&&a.jsxs("div",{className:"upload-message upload-error",children:[a.jsx("span",{className:"message-icon",children:"❌"}),a.jsx("span",{className:"message-text",children:i})]}),d&&a.jsxs("div",{className:"upload-message upload-success",children:[a.jsx("span",{className:"message-icon",children:"✅"}),a.jsx("span",{className:"message-text",children:d})]})]})}function Ne({components:e,onComponentRemoved:n,onRemove:t}){const[o,s]=j.useState(null),r=le(),i=async l=>{if(o)return;const u=`Are you sure you want to remove "${l.component.metadata.name}"?`;if(window.confirm(u)){s(l.id);try{ce(l.id)?(t?.(l.id,l.component.metadata.name),n?.()):alert("Failed to remove component. Please try again.")}catch(p){console.error("Error removing component:",p),alert("An error occurred while removing the component.")}finally{s(null)}}},c=l=>{try{const u=new Date(l);return u.toLocaleDateString()+" "+u.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return"Unknown"}},d=l=>{try{const u=JSON.stringify(l.component),p=new Blob([u]).size;return`${Math.round(p/1024)}KB`}catch{return"Unknown"}};return e.length===0?a.jsx("div",{className:"custom-component-list empty",children:a.jsxs("div",{className:"empty-state",children:[a.jsx("span",{className:"empty-icon",children:"📦"}),a.jsx("div",{className:"empty-text",children:"No custom components uploaded yet"}),a.jsx("div",{className:"empty-subtext",children:"Upload a .json component file to get started"})]})}):a.jsxs("div",{className:"custom-component-list",children:[a.jsxs("div",{className:"list-header",children:[a.jsxs("div",{className:"list-title",children:["Uploaded Components (",e.length,")"]}),a.jsxs("div",{className:"storage-info",children:[r.currentSizeMB.toFixed(1),"MB / ",r.maxSizeMB,"MB used"]})]}),a.jsx("div",{className:"component-items",children:e.map(l=>a.jsxs("div",{className:"component-item",children:[a.jsxs("div",{className:"component-info",children:[a.jsxs("div",{className:"component-header",children:[a.jsx("span",{className:"component-name",children:l.component.metadata.name}),a.jsx("span",{className:"component-type",children:l.component.metadata.type})]}),l.component.metadata.description&&a.jsx("div",{className:"component-description",children:l.component.metadata.description}),a.jsxs("div",{className:"component-meta",children:[a.jsxs("span",{className:"meta-item",children:[a.jsx("span",{className:"meta-label",children:"Uploaded:"}),a.jsx("span",{className:"meta-value",children:c(l.uploadedAt)})]}),a.jsxs("span",{className:"meta-item",children:[a.jsx("span",{className:"meta-label",children:"Size:"}),a.jsx("span",{className:"meta-value",children:d(l)})]}),l.originalFilename&&a.jsxs("span",{className:"meta-item",children:[a.jsx("span",{className:"meta-label",children:"File:"}),a.jsx("span",{className:"meta-value",children:l.originalFilename})]})]})]}),a.jsx("div",{className:"component-actions",children:a.jsx("button",{className:"remove-button",onClick:()=>i(l),disabled:o===l.id,title:`Remove ${l.component.metadata.name}`,children:o===l.id?"⏳":"🗑️"})})]},l.id))}),r.currentSizeMB>r.maxSizeMB*.8&&a.jsxs("div",{className:"storage-warning",children:[a.jsx("span",{className:"warning-icon",children:"⚠️"}),a.jsxs("span",{className:"warning-text",children:["Storage is ",Math.round(r.currentSizeMB/r.maxSizeMB*100),"% full. Consider removing unused components."]})]})]})}var ke=`You are a component generator for the RenderX platform.
Generate custom UI components in JSON format following this exact schema:

{
  "metadata": {
    "type": "string",         // kebab-case (e.g., "custom-button")
    "name": "string",         // Display name
    "category": "custom",     // Always "custom"
    "description": "string",
    "version": "1.0.0",
    "author": "AI Generated",
    "tags": ["string"]
  },
  "ui": {
    "template": "string",    // Handlebars template
    "styles": {
      "css": "string",
      "variables": {},
      "library": { "css": "string", "variables": {} }
    },
    "icon": { "mode": "emoji", "value": "string" },
    "tools": {
      "drag": { "enabled": true },
      "resize": { "enabled": true, "handles": ["nw", "n", "ne", "e", "se", "s", "sw", "w"] }
    }
  },
  "integration": {
    "properties": {
      "schema": { "propertyName": { "type": "string", "default": "value", "description": "..." } },
      "defaultValues": { "propertyName": "value" }
    },
    "events": {
      "click": { "description": "Triggered when clicked", "parameters": ["event", "elementData"] },
      "focus": { "description": "Triggered on focus", "parameters": ["event", "elementData"] },
      "blur": { "description": "Triggered on blur", "parameters": ["event", "elementData"] }
    },
    "canvasIntegration": {
      "resizable": true,
      "draggable": true,
      "selectable": true,
      "minWidth": 80,
      "minHeight": 30,
      "defaultWidth": 120,
      "defaultHeight": 40,
      "snapToGrid": true,
      "allowChildElements": false
    }
  },
  "interactions": {
    "canvas.component.create": { "pluginId": "CanvasComponentPlugin", "sequenceId": "canvas-component-create-symphony" },
    "canvas.component.select": { "pluginId": "CanvasComponentSelectionPlugin", "sequenceId": "canvas-component-select-symphony" },
    "canvas.component.drag.move": { "pluginId": "CanvasComponentDragPlugin", "sequenceId": "canvas-component-drag-symphony" },
    "canvas.component.resize.start": { "pluginId": "CanvasComponentResizeStartPlugin", "sequenceId": "canvas-component-resize-start-symphony" },
    "canvas.component.resize.move": { "pluginId": "CanvasComponentResizeMovePlugin", "sequenceId": "canvas-component-resize-move-symphony" },
    "canvas.component.resize.end": { "pluginId": "CanvasComponentResizeEndPlugin", "sequenceId": "canvas-component-resize-end-symphony" }
  }
}

CRITICAL RULES:
1. Always return valid JSON wrapped in \`\`\`json code blocks
2. Use Handlebars syntax: {{variable}}, {{#if condition}}, {{#each items}}
3. Include responsive CSS with CSS variables for customization
4. Add library preview styles in the library object
5. Choose appropriate emoji icons that represent the component
6. Keep templates semantic and accessible (use proper HTML elements)
7. Make components reusable and configurable with variables
8. Include hover effects and smooth transitions where appropriate
9. Use modern CSS features (flexbox, grid, custom properties)
10. Ensure components work well in both light and dark themes
11. ALWAYS include the "integration" field with properties schema, events, and canvasIntegration settings
12. ALWAYS include the "interactions" field with plugin/sequence mappings for canvas operations
13. ALWAYS include the "ui.tools" field with drag and resize configuration
14. Define all component properties in integration.properties.schema with types, defaults, and descriptions
15. Include standard canvas events (click, focus, blur) in integration.events
16. Set appropriate canvas integration constraints (minWidth, minHeight, defaultWidth, defaultHeight)

TEMPLATE PATTERNS:
- Buttons: <button class="{{classes}}" {{#if disabled}}disabled{{/if}}>{{text}}</button>
- Cards: <div class="card {{variant}}"><h3>{{title}}</h3><p>{{content}}</p></div>
- Inputs: <input type="{{type}}" placeholder="{{placeholder}}" value="{{value}}" />
- Lists: <ul class="{{listClass}}">{{#each items}}<li>{{this}}</li>{{/each}}</ul>

CSS BEST PRACTICES:
- Use CSS custom properties for theming: --primary-color, --text-color, etc.
- Include responsive breakpoints: @media (max-width: 768px)
- Add smooth transitions: transition: all 0.2s ease
- Use semantic color names: --success-color, --warning-color
- Include focus states for accessibility: :focus-visible
- Add hover effects: :hover { transform: translateY(-2px); }

EXAMPLE COMPONENT TYPES:
- Buttons (primary, secondary, outline, icon)
- Cards (basic, with image, pricing, profile)
- Forms (input, textarea, select, checkbox)
- Navigation (breadcrumb, tabs, pagination)
- Feedback (alert, toast, badge, progress)
- Layout (container, grid, sidebar, header)
- Content (testimonial, feature, pricing table)

Always provide a brief explanation of the component and its features after the JSON.`,J=[{metadata:{type:"custom-button",name:"Custom Button",category:"custom",description:"A customizable button with multiple variants",version:"1.0.0",author:"AI Generated",tags:["button","interactive","form"]},ui:{template:`<button class="custom-btn {{variant}} {{size}}" {{#if disabled}}disabled{{/if}}>
  {{#if icon}}<span class="btn-icon">{{icon}}</span>{{/if}}
  <span class="btn-text">{{text}}</span>
</button>`,styles:{css:`.custom-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.custom-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-btn.primary {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.custom-btn.secondary {
  background: var(--secondary-color, #6b7280);
  color: white;
}

.custom-btn.outline {
  background: transparent;
  border: 2px solid var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
}

.custom-btn.small {
  padding: 8px 16px;
  font-size: 14px;
}

.custom-btn.large {
  padding: 16px 32px;
  font-size: 18px;
}

.custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}`,variables:{text:"Click me",variant:"primary",size:"medium",disabled:!1,icon:""},library:{css:".custom-btn { padding: 8px 16px; font-size: 12px; }",variables:{text:"Button",variant:"primary",size:"small"}}},icon:{mode:"emoji",value:"🔘"},tools:{drag:{enabled:!0},resize:{enabled:!0,handles:["nw","n","ne","e","se","s","sw","w"]}}},integration:{properties:{schema:{text:{type:"string",default:"Click me",description:"Button text content",required:!0},variant:{type:"string",default:"primary",description:"Button style variant",enum:["primary","secondary","outline"]},size:{type:"string",default:"medium",description:"Button size",enum:["small","medium","large"]},disabled:{type:"boolean",default:!1,description:"Whether the button is disabled"}},defaultValues:{text:"Click me",variant:"primary",size:"medium",disabled:!1}},events:{click:{description:"Triggered when the button is clicked",parameters:["event","elementData"]},focus:{description:"Triggered when the button receives focus",parameters:["event","elementData"]},blur:{description:"Triggered when the button loses focus",parameters:["event","elementData"]}},canvasIntegration:{resizable:!0,draggable:!0,selectable:!0,minWidth:80,minHeight:30,maxWidth:400,maxHeight:100,defaultWidth:120,defaultHeight:40,snapToGrid:!0,allowChildElements:!1}},interactions:{"canvas.component.create":{pluginId:"CanvasComponentPlugin",sequenceId:"canvas-component-create-symphony"},"canvas.component.select":{pluginId:"CanvasComponentSelectionPlugin",sequenceId:"canvas-component-select-symphony"},"canvas.component.drag.move":{pluginId:"CanvasComponentDragPlugin",sequenceId:"canvas-component-drag-symphony"},"canvas.component.resize.start":{pluginId:"CanvasComponentResizeStartPlugin",sequenceId:"canvas-component-resize-start-symphony"},"canvas.component.resize.move":{pluginId:"CanvasComponentResizeMovePlugin",sequenceId:"canvas-component-resize-move-symphony"},"canvas.component.resize.end":{pluginId:"CanvasComponentResizeEndPlugin",sequenceId:"canvas-component-resize-end-symphony"}}}];function Ie(e){let n=ke;return e?.examples?.length&&(n+=`

EXAMPLE COMPONENTS:
`,e.examples.forEach((t,o)=>{n+=`
Example ${o+1}:
\`\`\`json
${JSON.stringify(t,null,2)}
\`\`\`
`})),e?.guidelines?.length&&(n+=`

ADDITIONAL GUIDELINES:
`,e.guidelines.forEach((t,o)=>{n+=`${o+1}. ${t}
`})),e?.constraints?.length&&(n+=`

CONSTRAINTS:
`,e.constraints.forEach((t,o)=>{n+=`${o+1}. ${t}
`})),n}var K=class{async enrichComponent(e,n){if(!n||n.length===0)return this.enrichWithDefaults(e);const t=this.findSimilarComponents(e,n);return t.length===0?this.enrichWithDefaults(e):{component:this.mergeComponentData(e,t),sourceComponents:t.map(s=>s.metadata.name),enrichmentStrategy:t.length>0?"similar-merge":"default",confidence:Math.min(.95,.7+t.length*.1)}}findSimilarComponents(e,n){const t=e.metadata.type.toLowerCase(),o=n.filter(r=>r.metadata.type.toLowerCase()===t);if(o.length>0)return o.slice(0,3);const s=n.filter(r=>{const i=r.metadata.type.toLowerCase();return i.includes(t)||t.includes(i)});return s.length>0?s.slice(0,3):n.slice(0,1)}mergeComponentData(e,n){const t={...e},o=e.integration?[e,...n]:n,s=this.mergeIntegration(o);s&&(t.integration=s);const r=this.mergeInteractions(n);return r&&Object.keys(r).length>0&&(t.interactions=r),!t.ui.tools&&n[0]?.ui?.tools&&(t.ui.tools=n[0].ui.tools),t}mergeIntegration(e){const n={},t={},o={};for(const r of e){if(r.integration?.properties?.schema)for(const[i,c]of Object.entries(r.integration.properties.schema))t[i]||(t[i]=c);if(r.integration?.properties?.defaultValues)for(const[i,c]of Object.entries(r.integration.properties.defaultValues))i in o||(o[i]=c)}Object.keys(t).length>0&&(n.properties={schema:t,defaultValues:o});const s={};for(const r of e)if(r.integration?.events)for(const[i,c]of Object.entries(r.integration.events))s[i]||(s[i]=c);return Object.keys(s).length>0&&(n.events=s),e[0]?.integration?.canvasIntegration&&(n.canvasIntegration=e[0].integration.canvasIntegration),Object.keys(n).length>0?n:null}mergeInteractions(e){const n={};for(const t of e)t.interactions&&Object.assign(n,t.interactions);return n}enrichWithDefaults(e){const n={...e};return n.integration||(n.integration={properties:{schema:{},defaultValues:{}},events:{click:{description:"Triggered when clicked",parameters:["event","elementData"]},focus:{description:"Triggered on focus",parameters:["event","elementData"]},blur:{description:"Triggered on blur",parameters:["event","elementData"]}},canvasIntegration:{resizable:!0,draggable:!0,selectable:!0,minWidth:80,minHeight:30,defaultWidth:120,defaultHeight:40,snapToGrid:!0,allowChildElements:!1}}),n.interactions||(n.interactions={"canvas.component.create":{pluginId:"CanvasComponentPlugin",sequenceId:"canvas-component-create-symphony"},"canvas.component.select":{pluginId:"CanvasComponentSelectionPlugin",sequenceId:"canvas-component-select-symphony"},"canvas.component.drag.move":{pluginId:"CanvasComponentDragPlugin",sequenceId:"canvas-component-drag-symphony"},"canvas.component.resize.start":{pluginId:"CanvasComponentResizeStartPlugin",sequenceId:"canvas-component-resize-start-symphony"},"canvas.component.resize.move":{pluginId:"CanvasComponentResizeMovePlugin",sequenceId:"canvas-component-resize-move-symphony"},"canvas.component.resize.end":{pluginId:"CanvasComponentResizeEndPlugin",sequenceId:"canvas-component-resize-end-symphony"}}),n.ui.tools||(n.ui.tools={drag:{enabled:!0},resize:{enabled:!0,handles:["nw","n","ne","e","se","s","sw","w"]}}),{component:n,sourceComponents:[],enrichmentStrategy:"default",confidence:.5}}},Y=class{apiKey;model;baseURL="https://api.openai.com/v1";ragEnrichment;constructor(){this.apiKey=_("OPENAI_API_KEY"),this.model=_("OPENAI_MODEL")||"gpt-4-turbo-preview",this.ragEnrichment=new K}static isConfigured(){return se("OPENAI_API_KEY")}getConfigStatus(){return this.apiKey?{configured:!0,model:this.model,message:"AI Component Generation Ready",action:null}:{configured:!1,message:"OpenAI API key not configured",instructions:"Contact your administrator to enable AI features",action:"contact_admin"}}async generateComponent(e){if(!this.apiKey)throw new E({type:"config_error",message:"OpenAI API key not configured. Please contact your administrator.",details:{action:"contact_admin"}});try{const n=this.buildMessages(e.prompt,e.context),t=e.options||{},o=await this.callOpenAI({model:t.model||this.model,messages:n,temperature:t.temperature||.7,max_tokens:t.maxTokens||2e3}),s=this.parseComponentResponse(o,e.prompt),r=e.libraryComponents||J,i=await this.ragEnrichment.enrichComponent(s.component,r);return{component:i.component,explanation:s.explanation,suggestions:s.suggestions,enrichmentMetadata:{sourceComponents:i.sourceComponents,enrichmentStrategy:i.enrichmentStrategy,confidence:i.confidence}}}catch(n){throw console.error("OpenAI generation failed:",n),n instanceof E?n:this.isOpenAIError(n)?new E({type:"api_error",message:`OpenAI API error: ${n.error.message}`,details:n.error}):new E({type:"network_error",message:"Failed to generate component. Please try again.",details:n})}}buildMessages(e,n){const t=[{role:"system",content:this.getSystemPrompt()}];if(n&&n.length>0){const o=n.slice(-4);for(const s of o)t.push({role:s.role==="user"?"user":"assistant",content:s.content})}return t.push({role:"user",content:e}),t}async callOpenAI(e){const n=await fetch(`${this.baseURL}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${this.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify(e)}),t=await n.json();if(!n.ok)throw t;return t}parseComponentResponse(e,n){const t=e.choices[0]?.message?.content;if(!t)throw new E({type:"api_error",message:"Empty response from OpenAI",details:e});try{const o=t.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)||t.match(/(\{[\s\S]*\})/);if(!o)throw new Error("No JSON found in response");const s=JSON.parse(o[1]);this.validateComponent(s);const r=t.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/,"").trim()||`Generated component "${s.metadata.name}" based on your request: "${n}"`;return{component:s,explanation:r,suggestions:this.generateSuggestions(s)}}catch(o){throw new E({type:"validation_error",message:`Failed to parse component JSON: ${o.message}`,details:{content:t,error:o}})}}validateComponent(e){const n=W(e);if(!n.isValid)throw new Error(`Component validation failed: ${n.errors.join(", ")}`);e.metadata.category="custom",e.metadata.author="AI Generated",e.metadata.version=e.metadata.version||"1.0.0",n.warnings.length>0&&console.warn("Component validation warnings:",n.warnings)}generateSuggestions(e){const n=[];return e.ui.styles?.css||n.push("Add custom CSS styling"),e.metadata.tags?.length||n.push("Add descriptive tags"),e.ui.icon||n.push("Add an icon for better visual identification"),n}getSystemPrompt(){return Ie({examples:J.slice(0,1),guidelines:["Focus on creating reusable, accessible components","Use semantic HTML elements","Include proper ARIA attributes where needed","Ensure components work in both light and dark themes"],constraints:["No external dependencies or imports","No JavaScript code in templates","Keep CSS concise but comprehensive","Use only standard web technologies"]})}isOpenAIError(e){return e&&e.error&&typeof e.error.message=="string"}},E=class extends Error{type;details;constructor(e){super(e.message),this.name="ChatError",this.type=e.type,this.details=e.details}};T(`.chat-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.user-message .message-avatar {
  background: #dbeafe;
}
.ai-message .message-avatar {
  background: #f3e8ff;
}
.error-message .message-avatar {
  background: #fef2f2;
}
.message-content {
  flex: 1;
  min-width: 0;
}
.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.message-role {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}
.message-timestamp {
  font-size: 12px;
  color: #9ca3af;
}
.message-text {
  color: #374151;
  line-height: 1.5;
  margin-bottom: 12px;
  word-wrap: break-word;
}
.error-message .message-text {
  color: #dc2626;
}
.component-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}
.component-header {
  margin-bottom: 16px;
}
.component-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.component-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.component-details {
  flex: 1;
  min-width: 0;
}
.component-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.component-description {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
}
.component-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.component-tag {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.component-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.action-button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.action-button.primary {
  background: #10b981;
  color: white;
}
.action-button.primary:hover {
  background: #059669;
  transform: translateY(-1px);
}
.action-button.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}
.action-button.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}
.action-button:active {
  transform: translateY(0);
}
.component-json {
  background: #1f2937;
  border-radius: 6px;
  overflow: hidden;
}
.json-header {
  background: #374151;
  color: white;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
}
.json-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.json-close:hover {
  opacity: 1;
}
.json-content {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family:
    "Monaco",
    "Menlo",
    "Ubuntu Mono",
    monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #e5e7eb;
  background: #1f2937;
}
.json-content code {
  color: inherit;
  background: none;
}
@media (max-width: 480px) {
  .component-actions {
    flex-direction: column;
  }
  .action-button {
    justify-content: center;
  }
  .json-content {
    font-size: 11px;
    padding: 12px;
  }
}
`);function ze({message:e,onAddToLibrary:n,onEditComponent:t,onCopyJSON:o,onRegenerateComponent:s}){const[r,i]=j.useState(!1),[c,d]=j.useState(!1),l=m=>new Date(m).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),u=async m=>{try{const v=JSON.stringify(m,null,2);await navigator.clipboard.writeText(v),d(!0),setTimeout(()=>d(!1),2e3),o&&o(m)}catch(v){console.error("Failed to copy JSON:",v)}},p=()=>{e.component&&n&&n(e.component)},h=()=>{e.component&&t&&t(e.component)},f=()=>{if(s){const m=e.content.includes("based on your request:")?e.content.split("based on your request:")[1]?.replace(/['"]/g,"").trim():"Regenerate this component with improvements";s(m)}},x=m=>a.jsxs("div",{className:"component-preview",children:[a.jsx("div",{className:"component-header",children:a.jsxs("div",{className:"component-info",children:[a.jsx("span",{className:"component-icon",children:m.ui.icon?.value||"🧩"}),a.jsxs("div",{className:"component-details",children:[a.jsx("h4",{className:"component-name",children:m.metadata.name}),a.jsx("p",{className:"component-description",children:m.metadata.description}),a.jsx("div",{className:"component-tags",children:m.metadata.tags?.map((v,b)=>a.jsx("span",{className:"component-tag",children:v},b))})]})]})}),a.jsxs("div",{className:"component-actions",children:[a.jsx("button",{className:"action-button primary",onClick:p,title:"Add to Component Library",children:"➕ Add to Library"}),a.jsx("button",{className:"action-button secondary",onClick:()=>i(!r),title:"View/Hide JSON",children:r?"👁️ Hide JSON":"📄 View JSON"}),a.jsx("button",{className:"action-button secondary",onClick:()=>u(m),title:"Copy JSON to clipboard",children:c?"✅ Copied!":"📋 Copy JSON"}),t&&a.jsx("button",{className:"action-button secondary",onClick:h,title:"Edit component",children:"✏️ Edit"}),a.jsx("button",{className:"action-button secondary",onClick:f,title:"Generate a new version",children:"🔄 Try Again"})]}),r&&a.jsxs("div",{className:"component-json",children:[a.jsxs("div",{className:"json-header",children:[a.jsx("span",{children:"Component JSON"}),a.jsx("button",{className:"json-close",onClick:()=>i(!1),title:"Hide JSON",children:"✕"})]}),a.jsx("pre",{className:"json-content",children:a.jsx("code",{children:JSON.stringify(m,null,2)})})]})]});return a.jsxs("div",{className:`chat-message ${e.role}-message ${e.error?"error-message":""}`,children:[a.jsx("div",{className:"message-avatar",children:e.role==="user"?"👤":e.error?"❌":"🤖"}),a.jsxs("div",{className:"message-content",children:[a.jsxs("div",{className:"message-header",children:[a.jsx("span",{className:"message-role",children:e.role==="user"?"You":e.error?"Error":"AI Assistant"}),a.jsx("span",{className:"message-timestamp",children:l(e.timestamp)})]}),a.jsx("div",{className:"message-text",children:e.content}),e.component&&!e.error&&x(e.component)]})]})}T(`.config-status-panel {
  padding: 24px;
  margin: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.config-status-panel.configured {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}
.config-status-panel.not-configured {
  background: #fefce8;
  border: 1px solid #fde047;
  color: #854d0e;
  text-align: left;
  align-items: stretch;
}
.status-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.status-content {
  width: 100%;
}
.status-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}
.status-message {
  margin: 0 0 16px 0;
  color: #6b7280;
  line-height: 1.5;
}
.status-instructions {
  margin: 0 0 24px 0;
  font-style: italic;
  color: #9ca3af;
}
.status-model {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}
.setup-guide {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-top: 16px;
}
.setup-guide h5 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
.setup-steps {
  margin: 0 0 24px 0;
  padding-left: 20px;
}
.setup-steps li {
  margin-bottom: 8px;
  line-height: 1.5;
}
.external-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}
.external-link:hover {
  text-decoration: underline;
}
.env-example,
.env-file-example {
  background: #1f2937;
  color: #e5e7eb;
  padding: 12px;
  border-radius: 6px;
  font-family:
    "Monaco",
    "Menlo",
    "Ubuntu Mono",
    monospace;
  font-size: 13px;
  margin: 8px 0;
  overflow-x: auto;
  white-space: pre;
}
.dev-setup {
  margin-bottom: 24px;
}
.dev-setup p {
  margin: 0 0 8px 0;
}
.dev-setup code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family:
    "Monaco",
    "Menlo",
    "Ubuntu Mono",
    monospace;
  font-size: 13px;
}
.security-note,
.cost-info {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}
.security-note {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}
.cost-info {
  background: #fefce8;
  border: 1px solid #fde047;
  color: #854d0e;
}
.note-icon,
.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.note-content,
.info-content {
  flex: 1;
}
.note-content strong,
.info-content strong {
  display: block;
  margin-bottom: 4px;
}
.cost-info ul {
  margin: 8px 0;
  padding-left: 20px;
}
.cost-info li {
  margin-bottom: 4px;
}
.cost-info p {
  margin: 8px 0 0 0;
}
.help-links {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
.help-links h5 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}
.help-list {
  margin: 0;
  padding-left: 20px;
}
.help-list li {
  margin-bottom: 8px;
}
.help-list a {
  color: #3b82f6;
  text-decoration: none;
}
.help-list a:hover {
  text-decoration: underline;
}
@media (max-width: 480px) {
  .config-status-panel {
    margin: 8px;
    padding: 16px;
  }
  .setup-guide {
    padding: 16px;
  }
  .env-example,
  .env-file-example {
    font-size: 12px;
    padding: 8px;
  }
  .security-note,
  .cost-info {
    flex-direction: column;
    gap: 8px;
  }
}
`);function Ee({status:e}){return e.configured?a.jsxs("div",{className:"config-status-panel configured",children:[a.jsx("div",{className:"status-icon",children:"✅"}),a.jsxs("div",{className:"status-content",children:[a.jsx("h4",{className:"status-title",children:e.message}),e.model&&a.jsxs("p",{className:"status-model",children:["Using model: ",a.jsx("strong",{children:e.model})]})]})]}):a.jsxs("div",{className:"config-status-panel not-configured",children:[a.jsx("div",{className:"status-icon",children:"⚙️"}),a.jsxs("div",{className:"status-content",children:[a.jsx("h4",{className:"status-title",children:"AI Features Not Available"}),a.jsx("p",{className:"status-message",children:e.message}),e.instructions&&a.jsx("p",{className:"status-instructions",children:e.instructions}),a.jsxs("div",{className:"setup-guide",children:[a.jsx("h5",{children:"For Administrators:"}),a.jsxs("ol",{className:"setup-steps",children:[a.jsxs("li",{children:["Get an API key from"," ",a.jsx("a",{href:"https://platform.openai.com/api-keys",target:"_blank",rel:"noopener noreferrer",className:"external-link",children:"OpenAI Platform"})]}),a.jsxs("li",{children:["Set the environment variable:",a.jsx("pre",{className:"env-example",children:"OPENAI_API_KEY=sk-your-key-here"})]}),a.jsx("li",{children:"Restart the application"})]}),a.jsx("h5",{children:"For Local Development:"}),a.jsxs("div",{className:"dev-setup",children:[a.jsxs("p",{children:["Create a ",a.jsx("code",{children:".env.local"})," file in your project root:"]}),a.jsx("pre",{className:"env-file-example",children:`# .env.local
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview  # optional`})]}),a.jsxs("div",{className:"security-note",children:[a.jsx("div",{className:"note-icon",children:"🔒"}),a.jsxs("div",{className:"note-content",children:[a.jsx("strong",{children:"Security Note:"})," API keys are managed securely by the host application and never stored in browser storage. Contact your administrator to enable AI features."]})]}),a.jsxs("div",{className:"cost-info",children:[a.jsx("div",{className:"info-icon",children:"💰"}),a.jsxs("div",{className:"info-content",children:[a.jsx("strong",{children:"Cost Information:"}),a.jsxs("ul",{children:[a.jsx("li",{children:"GPT-4: ~$0.02-0.05 per component"}),a.jsx("li",{children:"GPT-3.5-Turbo: ~$0.002-0.005 per component"})]}),a.jsx("p",{children:"Set spending limits in your OpenAI dashboard."})]})]})]}),a.jsxs("div",{className:"help-links",children:[a.jsx("h5",{children:"Need Help?"}),a.jsxs("ul",{className:"help-list",children:[a.jsx("li",{children:a.jsx("a",{href:"https://platform.openai.com/docs/quickstart",target:"_blank",rel:"noopener noreferrer",children:"OpenAI API Documentation"})}),a.jsx("li",{children:a.jsx("a",{href:"https://platform.openai.com/account/billing",target:"_blank",rel:"noopener noreferrer",children:"Manage Billing & Usage"})}),a.jsx("li",{children:a.jsx("a",{href:"https://platform.openai.com/account/limits",target:"_blank",rel:"noopener noreferrer",children:"Set Usage Limits"})})]})]})]})]})}var R="renderx:ai-chat-history",Ae=10,Me=50;function Fe(){return`chat-${Date.now()}-${Math.random().toString(36).substring(2,8)}`}function X(e){const n=e.find(t=>t.role==="user");if(n){const t=n.content.trim();return t.length>50?`${t.substring(0,50)}...`:t}return`Chat ${new Date().toLocaleDateString()}`}function B(){try{const e=localStorage.getItem(R);if(!e)return[];const n=JSON.parse(e);return Array.isArray(n)?n:[]}catch(e){return console.warn("Failed to load chat history:",e),[]}}function L(e){try{const t=e.slice(-Ae).map(o=>({...o,messages:o.messages.slice(-Me)}));return localStorage.setItem(R,JSON.stringify(t)),!0}catch(n){return console.warn("Failed to save chat history:",n),!1}}function Z(e=[]){return{id:Fe(),title:e.length>0?X(e):"New Chat",messages:e,created:Date.now(),updated:Date.now()}}function Oe(e){try{const n=B();if(n.length===0){const o=Z(e);return L([o])}const t=n[n.length-1];return t.messages=[...t.messages,...e],t.updated=Date.now(),t.title==="New Chat"&&e.length>0&&(t.title=X(t.messages)),L(n)}catch(n){return console.warn("Failed to add messages to session:",n),!1}}function Q(){const e=B();return e.length>0?e[e.length-1]:null}function Pe(){const e=Z(),n=B();return L([...n,e]),e}function Te(){try{return localStorage.removeItem(R),!0}catch(e){return console.warn("Failed to clear chat history:",e),!1}}function V(e=6){const n=Q();return!n||n.messages.length===0?[]:n.messages.filter(t=>!t.error).slice(-e)}T(`.chat-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  cursor: pointer;
}
.chat-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border: 1px solid #e1e5e9;
  overflow: hidden;
}
.chat-header {
  background:
    linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px 12px 0 0;
}
.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.chat-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.model-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.clear-history-button,
.new-chat-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.clear-history-button:hover:not(:disabled),
.new-chat-button:hover {
  opacity: 1;
}
.clear-history-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.chat-close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.chat-close-button:hover {
  opacity: 1;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chat-welcome {
  text-align: center;
  padding: 32px 16px;
  color: #6b7280;
}
.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.chat-welcome h4 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
}
.chat-welcome p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}
.example-prompts {
  text-align: left;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
}
.example-prompts p {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #374151;
}
.example-prompts ul {
  margin: 0;
  padding-left: 20px;
}
.example-prompts li {
  margin-bottom: 4px;
  font-style: italic;
  color: #6b7280;
}
.chat-message.loading {
  opacity: 0.8;
}
.typing-indicator {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}
.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}
.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}
.chat-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  margin: 0 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.error-icon {
  flex-shrink: 0;
}
.error-text {
  flex: 1;
}
.error-dismiss {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.error-dismiss:hover {
  opacity: 1;
}
.chat-input {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
  background: #f9fafb;
}
.chat-input-field {
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.chat-input-field:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.chat-send-button {
  padding: 12px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  min-width: 48px;
}
.chat-send-button:hover:not(:disabled) {
  background: #5a67d8;
}
.chat-send-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
@media (max-width: 768px) {
  .chat-window {
    width: 95%;
    max-width: 100%;
    max-height: 90vh;
  }
}
@media (max-width: 480px) {
  .chat-window {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    top: 0;
    left: 0;
    transform: none;
    border-radius: 0;
  }
  .chat-header {
    border-radius: 0;
  }
  .chat-modal-backdrop {
    display: none;
  }
}
`);function De({isOpen:e,onClose:n,onComponentGenerated:t}){const[o]=j.useState(()=>new Y),[s,r]=j.useState([]),[i,c]=j.useState(""),[d,l]=j.useState(!1),[u,p]=j.useState(null),h=j.useRef(null),f=j.useRef(null),x=o.getConfigStatus();j.useEffect(()=>{h.current?.scrollIntoView({behavior:"smooth"})},[s]),j.useEffect(()=>{e&&x.configured&&f.current?.focus()},[e,x.configured]),j.useEffect(()=>{const g=C=>{C.key==="Escape"&&e&&n()};if(e)return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[e,n]),j.useEffect(()=>{x.configured&&m()},[x.configured]),j.useEffect(()=>{s.length>0&&Oe(s)},[s]);const m=()=>{try{const g=Q();g&&g.messages.length>0&&r(g.messages)}catch(g){console.warn("Failed to load current chat session:",g)}},v=()=>{r([]),Te()},b=()=>{r([]),Pe()},k=async()=>{const g=i.trim();if(!g||d)return;c(""),p(null),l(!0);const C={id:`user-${Date.now()}`,role:"user",content:g,timestamp:Date.now()};r(S=>[...S,C]);try{const S=V(4),z=await o.generateComponent({prompt:g,context:S}),A={id:`ai-${Date.now()}`,role:"assistant",content:z.explanation,timestamp:Date.now(),component:z.component};r(ee=>[...ee,A])}catch(S){console.error("Chat error:",S);const z={id:`error-${Date.now()}`,role:"assistant",content:S.message||"Sorry, I encountered an error while generating the component. Please try again.",timestamp:Date.now(),error:!0};r(A=>[...A,z]),p(S.message)}finally{l(!1)}},y=g=>{g.key==="Enter"&&!g.shiftKey&&(g.preventDefault(),k())},w=g=>{t(g)},N=async g=>{p(null),l(!0);try{const C=V(2),S=await o.generateComponent({prompt:`Please regenerate this component with improvements: ${g}`,context:C}),z={id:`ai-regen-${Date.now()}`,role:"assistant",content:`Here's an improved version: ${S.explanation}`,timestamp:Date.now(),component:S.component};r(A=>[...A,z])}catch(C){console.error("Regeneration error:",C),p(C.message)}finally{l(!1)}};return e?x.configured?a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"chat-modal-backdrop",onClick:n}),a.jsxs("div",{className:"chat-window",children:[a.jsxs("div",{className:"chat-header",children:[a.jsx("h3",{children:"🤖 AI Component Generator"}),a.jsxs("div",{className:"chat-header-info",children:[a.jsx("span",{className:"model-badge",title:`Using ${x.model}`,children:x.model?.replace("gpt-","GPT-")||"GPT-4"}),a.jsx("button",{className:"clear-history-button",onClick:v,title:"Clear chat history",disabled:s.length===0,children:"🗑️"}),a.jsx("button",{className:"new-chat-button",onClick:b,title:"Start new chat",children:"➕"})]}),a.jsx("button",{className:"chat-close-button",onClick:n,title:"Close",children:"✕"})]}),a.jsxs("div",{className:"chat-messages",children:[s.length===0&&a.jsxs("div",{className:"chat-welcome",children:[a.jsx("div",{className:"welcome-icon",children:"🎨"}),a.jsx("h4",{children:"Welcome to AI Component Generator!"}),a.jsx("p",{children:"Describe a component you'd like to create and I'll generate it for you."}),a.jsxs("div",{className:"example-prompts",children:[a.jsx("p",{children:a.jsx("strong",{children:"Try these examples:"})}),a.jsxs("ul",{children:[a.jsx("li",{children:'"Create a blue button with rounded corners"'}),a.jsx("li",{children:'"Make a card component with a title and description"'}),a.jsx("li",{children:'"Design a loading spinner with animation"'})]})]})]}),s.map(g=>a.jsx(ze,{message:g,onAddToLibrary:w,onRegenerateComponent:N},g.id)),d&&a.jsxs("div",{className:"chat-message ai-message loading",children:[a.jsx("div",{className:"message-avatar",children:"🤖"}),a.jsxs("div",{className:"message-content",children:[a.jsxs("div",{className:"typing-indicator",children:[a.jsx("span",{}),a.jsx("span",{}),a.jsx("span",{})]}),a.jsx("p",{children:"Generating component..."})]})]}),a.jsx("div",{ref:h})]}),u&&a.jsxs("div",{className:"chat-error",children:[a.jsx("span",{className:"error-icon",children:"⚠️"}),a.jsx("span",{className:"error-text",children:u}),a.jsx("button",{onClick:()=>p(null),className:"error-dismiss",children:"✕"})]}),a.jsxs("div",{className:"chat-input",children:[a.jsx("input",{ref:f,type:"text",value:i,onChange:g=>c(g.target.value),onKeyDown:y,placeholder:"Describe a component you'd like to create...",disabled:d,className:"chat-input-field"}),a.jsx("button",{onClick:k,disabled:d||!i.trim(),className:"chat-send-button",title:"Send message",children:d?"⏳":"📤"})]})]})]}):a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"chat-modal-backdrop",onClick:n}),a.jsxs("div",{className:"chat-window",children:[a.jsxs("div",{className:"chat-header",children:[a.jsx("h3",{children:"🤖 AI Component Generator"}),a.jsx("button",{className:"chat-close-button",onClick:n,title:"Close",children:"✕"})]}),a.jsx(Ee,{status:x})]})]}):null}var qe=class extends I.Component{constructor(e){super(e),this.state={hasError:!1}}static getDerivedStateFromError(e){return{hasError:!0,error:e}}componentDidCatch(e,n){console.error("Custom component error:",e,n)}render(){return this.state.hasError?a.jsxs("div",{className:"custom-component-error",children:[a.jsx("span",{className:"error-icon",children:"⚠️"}),a.jsxs("div",{className:"error-text",children:[a.jsx("div",{className:"error-title",children:"Custom Component Error"}),a.jsx("div",{className:"error-message",children:"There was an error loading custom components. Please try refreshing the page."})]})]}):this.props.children}};async function Le(e,n){try{const t=new Set;for(const o of Array.isArray(e)?e:[]){const s=o?.template??o;let r=s?.css;if(!r&&o?.ui?.styles?.css&&(r=o.ui.styles.css),typeof r!="string"||!r.trim())continue;const c=(Array.isArray(s?.classes)?s.classes:[]).find(u=>u.startsWith("rx-")&&u!=="rx-comp"),d=o?.metadata?.replaces||o?.metadata?.type,l=c||(d?`rx-${d}`:void 0);!l||t.has(l)||t.add(l)}}catch{}}function Ue(){const e=te(),[n,t]=I.useState([]),[o,s]=I.useState(0),[r,i]=I.useState(!1),c=Array.isArray(n)?n:[],d=M(),l=Y.isConfigured(),u=I.useCallback(async()=>{try{await U.publish("library.load.requested",{onComponentsLoaded:m=>t(m)},e)}catch{}try{const m=H("library.load");if(!m?.pluginId||!m?.sequenceId)throw new Error("Unknown interaction 'library.load'");await e?.play?.(m.pluginId,m.sequenceId,{onComponentsLoaded:v=>t(v)})}catch(m){ae("ui.layout-manifest")&&console.warn("LibraryPanel: fallback routing unavailable (no host router and unknown interaction 'library.load').",m)}},[e]);I.useEffect(()=>{u()},[u,o]),I.useEffect(()=>{!e||!c?.length||Le(c)},[c,e]);const p=()=>{s(m=>m+1)},h=()=>{s(m=>m+1)},f=async m=>{try{const v=await G(m);v.success?(s(b=>b+1),i(!1),console.log("AI-generated component added to library:",m.metadata.name)):console.error("Failed to save AI-generated component:",v.error)}catch(v){console.error("Failed to save AI-generated component:",v)}},x=he(c);return x.custom||(x.custom=[]),a.jsxs("div",{className:"library-sidebar",children:[a.jsxs("div",{className:"library-sidebar-header",children:[a.jsxs("div",{className:"library-header-content",children:[a.jsx("h2",{className:"library-sidebar-title",children:"🧩 Component Library"}),a.jsx("p",{className:"library-sidebar-subtitle",children:"Drag components to the canvas"})]}),a.jsxs("div",{className:"library-header-actions",children:[l&&a.jsx("button",{className:"ai-chat-toggle",onClick:()=>i(!r),title:"AI Component Generator","aria-label":"Open AI Component Generator",children:"🤖 AI"}),!l&&a.jsx("div",{className:"ai-unavailable-hint",title:"AI features require configuration by administrator",children:a.jsx("span",{className:"hint-icon",children:"💡"})})]})]}),a.jsx("div",{className:"library-component-library rx-lib",children:Object.entries(x).map(([m,v])=>a.jsxs("div",{className:"library-component-category",children:[a.jsx("div",{className:"library-category-title",children:fe(m)}),m==="custom"&&a.jsxs(qe,{children:[a.jsx(Se,{onComponentAdded:p}),d.length>0&&a.jsx(Ne,{components:d,onComponentRemoved:h})]}),a.jsx("div",{className:"library-component-grid",children:v.map(b=>a.jsx(xe,{component:b,conductor:e},b.id))})]},m))}),r&&l&&a.jsx(De,{isOpen:r,onClose:()=>i(!1),onComponentGenerated:f})]})}var $e=class{async extractPatterns(e){const n=new Map,t=this.extractPluginSequenceMappings(e),o=this.extractEventSequences(e),s=this.extractDataFlowPatterns(e);for(const r of t){const i=this.inferComponentType(r.topic),c=this.inferOperation(r.topic);n.has(i)||n.set(i,{componentType:i,operations:{}});const d=n.get(i);d.operations[c]||(d.operations[c]={pluginSequenceMappings:[],eventSequences:[],dataFlowPatterns:[],averageDuration:0,frequency:0}),d.operations[c].pluginSequenceMappings.push(r)}for(const r of n.values())for(const i of Object.keys(r.operations)){const c=r.operations[i];c.eventSequences=o.filter(d=>c.pluginSequenceMappings.some(l=>l.sequenceId===d.sequenceId)),c.eventSequences.length>0&&(c.averageDuration=c.eventSequences.reduce((d,l)=>d+l.totalDuration,0)/c.eventSequences.length),c.frequency=c.eventSequences.length,c.dataFlowPatterns=s.filter(d=>c.eventSequences.some(l=>l.movements.some(u=>u.beats.some(p=>p.event===d.event))))}return Array.from(n.values())}extractPluginSequenceMappings(e){const n=[],t=new Set;for(const o of e)for(const s of o.lines){const r=s.match(/\[topics\]\s+Routing\s+'([^']+)'\s+->\s+(\w+)::([a-z0-9\-]+)/);if(r){const[,i,c,d]=r,l=`${i}:${c}:${d}`;t.has(l)||(t.add(l),n.push({topic:i,pluginId:c,sequenceId:d,sequenceName:this.inferSequenceName(d)}))}}return n}extractEventSequences(e){const n=new Map;let t=null,o=null;for(const s of e)for(const r of s.lines){const i=r.match(/PluginInterfaceFacade\.play\(\):\s+\w+\s+->\s+([a-z0-9\-]+)/);if(i){const p=i[1];n.has(p)?t=n.get(p):(t={sequenceId:p,sequenceName:this.inferSequenceName(p),movements:[],totalDuration:0,eventCount:0},n.set(p,t))}const c=r.match(/Movement Started:\s+(\w+)\s+\((\d+)\s+beats\)/);if(c&&t){const[,p]=c;o={name:p,beats:[],duration:0},t.movements.push(o)}const d=r.match(/Beat\s+(\d+)\s+Started:\s+([^(]+)\s+\(([^)]+)\)/);if(d&&o){const[,p,h,f]=d;o.beats.push({number:parseInt(p),title:h.trim(),event:f,duration:0})}const l=r.match(/Beat\s+(\d+)\s+\(([^)]+)\)\s+completed in\s+([\d.]+)ms/);if(l&&o){const[,p,,h]=l,f=o.beats.find(x=>x.number===parseInt(p));f&&(f.duration=parseFloat(h),o.duration+=f.duration)}const u=r.match(/Sequence\s+"[^"]+"\s+completed in\s+(\d+)ms/);u&&t&&(t.totalDuration=parseInt(u[1]),t.eventCount=t.movements.reduce((p,h)=>p+h.beats.length,0))}return Array.from(n.values())}extractDataFlowPatterns(e){const n=[];for(const t of e)for(const o of t.lines){const s=o.match(/DataBaton:\s+\+([^|]+)\s+\|\s+.*event=([^\s]+)(?:\s+handler=([^\s]+))?(?:\s+plugin=([^\s]+))?/);if(s){const[,i,c,d,l]=s;n.push({event:c,handler:d,pluginId:l,changes:i.split(",").map(u=>u.trim()),changeType:"added"})}const r=o.match(/DataBaton:\s+~([^|]+)\s+\|\s+.*event=([^\s]+)(?:\s+handler=([^\s]+))?(?:\s+plugin=([^\s]+))?/);if(r){const[,i,c,d,l]=r;n.push({event:c,handler:d,pluginId:l,changes:i.split(",").map(u=>u.trim()),changeType:"removed"})}}return n}inferComponentType(e){return e.includes("canvas.component")?"canvas-component":e.includes("canvas.line")?"canvas-line":e.includes("library.component")?"library-component":e.includes("library")?"library":e.includes("control.panel")?"control-panel":"unknown"}inferOperation(e){const t=e.replace(/\.requested$/,"").split(".");for(let o=t.length-1;o>=0;o--){const s=t[o];if(s&&s!=="component"&&s!=="line"&&s!=="canvas"&&s!=="library"&&s!=="control"&&s!=="panel")return s}return t[t.length-1]||"unknown"}inferSequenceName(e){return e.split("-").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" ")}},He=class extends K{behaviorExtractor;constructor(){super(),this.behaviorExtractor=new $e}async enrichComponentWithTelemetry(e,n,t){const o=await this.enrichComponent(e,n),s=await this.behaviorExtractor.extractPatterns(t),r=e.metadata.type.toLowerCase(),i=this.findMatchingPattern(r,s);if(!i)return{...o,telemetryUsed:!1,interactionCount:Object.keys(o.component.interactions||{}).length};const c=this.enrichWithTelemetryPatterns(o.component,i);return{component:c,sourceComponents:o.sourceComponents,enrichmentStrategy:"similar-merge",confidence:Math.min(.99,o.confidence+.15),telemetryUsed:!0,extractedPatterns:i,interactionCount:Object.keys(c.interactions||{}).length}}findMatchingPattern(e,n){let t=n.find(o=>o.componentType===e);return t||(t=n.find(o=>o.componentType.includes(e)||e.includes(o.componentType)),t)?t:n.length>0?n[0]:null}enrichWithTelemetryPatterns(e,n){const t={...e},o=this.extractInteractionsFromPattern(n);return Object.keys(o).length>0&&(t.interactions={...t.interactions,...o}),t.integration||(t.integration={}),t.integration.telemetryInsights={operationCount:Object.keys(n.operations).length,averageExecutionTime:this.calculateAverageExecutionTime(n),commonOperations:Object.keys(n.operations).slice(0,5),dataFlowPatterns:this.extractDataFlowSummary(n)},t}extractInteractionsFromPattern(e){const n={};for(const[t,o]of Object.entries(e.operations)){const s=o.pluginSequenceMappings[0];s&&(n[`canvas.component.${t}`]={pluginId:s.pluginId,sequenceId:s.sequenceId,topic:s.topic,frequency:o.frequency,averageDuration:Math.round(o.averageDuration),eventSequences:o.eventSequences.map(r=>({sequenceId:r.sequenceId,sequenceName:r.sequenceName,eventCount:r.eventCount,totalDuration:r.totalDuration}))})}return n}calculateAverageExecutionTime(e){const n=Object.values(e.operations).filter(t=>t.averageDuration>0).map(t=>t.averageDuration);return n.length===0?0:Math.round(n.reduce((t,o)=>t+o,0)/n.length)}extractDataFlowSummary(e){const n={};for(const[t,o]of Object.entries(e.operations))if(o.dataFlowPatterns.length>0){const s=o.dataFlowPatterns.filter(i=>i.changeType==="added").flatMap(i=>i.changes),r=o.dataFlowPatterns.filter(i=>i.changeType==="removed").flatMap(i=>i.changes);(s.length>0||r.length>0)&&(n[t]={fieldsAdded:[...new Set(s)],fieldsRemoved:[...new Set(r)]})}return n}};async function Ge(e){if(!e?.mount)return;const n={pluginId:"LibraryPlugin",id:"library-load-symphony",name:"Library Load",movements:[{id:"load",name:"Load",beats:[{beat:1,event:"library:components:load",title:"Load Components",dynamics:"mf",handler:"loadComponents",timing:"immediate",kind:"pure"},{beat:2,event:"library:components:notify-ui",title:"Notify UI",dynamics:"mf",handler:"notifyUi",timing:"immediate",kind:"pure"}]}]},t=o=>{const s="_runtimeMountedSeqIds",r=e[s]||new Set;r.add(o),e[s]=r};await e.mount(n,de,n.pluginId),t(n.id)}export{$e as ComponentBehaviorExtractor,Ue as LibraryPanel,K as RAGEnrichmentService,He as RAGEnrichmentTelemetryService,de as handlers,Ge as register};
