var y=class{constructor(){this.state={classes:new Map,isLoaded:!1,lastModified:Date.now()},this.styleElement=null,this.initializeStyleElement(),this.loadDefaultClasses()}initializeStyleElement(){this.styleElement=null}loadDefaultClasses(){const e=[{name:"rx-button",content:`.rx-button {
  background-color: var(--bg-color, #3b82f6);
  color: var(--text-color, #ffffff);
  border: var(--border, none);
  padding: var(--padding, 12px 24px);
  border-radius: var(--border-radius, 8px);
  cursor: pointer;
  font-size: var(--font-size, 14px);
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  user-select: none;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}`,isBuiltIn:!0},{name:"rx-container",content:`.rx-container {
  position: relative;
  background: var(--bg, #fafafa);
  border: 1px dashed #9ca3af;
  border-radius: 8px;
  min-height: 120px;
  min-width: 200px;
  padding: var(--padding, 16px);
  box-sizing: border-box;
}`,isBuiltIn:!0},{name:"rx-comp-div",content:`.rx-comp-div {
  position: relative;
  display: block;
  box-sizing: border-box;
  min-height: 20px;
  min-width: 20px;
}`,isBuiltIn:!0}],s=Date.now();e.forEach(t=>{this.state.classes.set(t.name,{...t,createdAt:s,updatedAt:s})}),this.updateStylesheet(),this.state.isLoaded=!0,this.notifyObservers()}updateStylesheet(){if(!this.styleElement)return;const e=Array.from(this.state.classes.values()).map(s=>s.content).join(`

`);this.styleElement._pendingContent=e}notifyObservers(){}getAllClasses(){return Array.from(this.state.classes.values())}getClass(e){return this.state.classes.get(e)}hasClass(e){return this.state.classes.has(e)}createClass(e,s){if(this.state.classes.has(e))return!1;const t=Date.now(),r={name:e,content:s,createdAt:t,updatedAt:t,isBuiltIn:!1};return this.state.classes.set(e,r),this.state.lastModified=t,this.updateStylesheet(),this.notifyObservers(),!0}updateClass(e,s){const t=this.state.classes.get(e);if(!t)return!1;const r=Date.now(),n={...t,content:s,updatedAt:r};return this.state.classes.set(e,n),this.state.lastModified=r,this.updateStylesheet(),this.notifyObservers(),!0}removeClass(e){const s=this.state.classes.get(e);return!s||s.isBuiltIn?!1:(this.state.classes.delete(e),this.state.lastModified=Date.now(),this.updateStylesheet(),this.notifyObservers(),!0)}getClassNames(){return Array.from(this.state.classes.keys())}isLoaded(){return this.state.isLoaded}getLastModified(){return this.state.lastModified}},u=new y;typeof globalThis<"u"&&(globalThis.cssRegistry=u);function g(e,s){try{let t=s?.payload?.components||[];if((!t||t.length===0)&&typeof document<"u"){const a=document.getElementById("rx-canvas");if(a){const o=[],i=a.querySelectorAll(".rx-comp");for(const p of Array.from(i)){const l=p,d=Array.from(l.classList),c=d.find(f=>f.startsWith("rx-")&&f!=="rx-comp"),h=c?c.replace("rx-",""):l.tagName.toLowerCase();o.push({id:l.id,type:h,classes:d,createdAt:Date.now()})}o.length>0&&(t=o,s.payload.components=o,s.payload.source="dom-discovery",s.logger?.info?.(`DOM discovery (CSS step) found ${o.length} components`))}}const r=new Set;for(const a of t){const o=Array.isArray(a.classes)?a.classes:Array.isArray(a.template?.classRefs)?a.template.classRefs:[];for(const i of o)r.add(i)}const n={};r.forEach(a=>{const o=u.getClass(a);o&&(n[a]=o)}),s.payload.cssClasses=n,s.payload.cssClassCount=Object.keys(n).length,s.logger?.info?.(`Stage-crew collected ${s.payload.cssClassCount} CSS class definitions from registry`)}catch(t){s.logger?.error?.("Stage-crew CSS collection failed:",t),s.payload.cssClasses={},s.payload.cssClassCount=0,s.payload.error=String(t)}}export{g as collectCssClasses};
