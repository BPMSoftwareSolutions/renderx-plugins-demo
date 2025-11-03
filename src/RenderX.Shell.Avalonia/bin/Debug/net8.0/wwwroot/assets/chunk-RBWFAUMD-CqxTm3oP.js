var a="__RX_CP_OBSERVERS__";function n(){const t=globalThis;return t[a]||(t[a]={selectionObserver:null,classesObserver:null,cssRegistryObserver:null}),t[a]}function o(){return n().cssRegistryObserver}var l=class{state={classes:new Map,isLoaded:!1,lastModified:Date.now()};styleElement=null;constructor(){this.initializeStyleElement(),this.loadDefaultClasses()}initializeStyleElement(){this.styleElement=null}loadDefaultClasses(){const t=[{name:"rx-button",content:`.rx-button {
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
}`,isBuiltIn:!0}],e=Date.now();t.forEach(s=>{this.state.classes.set(s.name,{...s,createdAt:e,updatedAt:e})}),this.updateStylesheet(),this.state.isLoaded=!0,this.notifyObservers()}updateStylesheet(){if(!this.styleElement)return;const t=Array.from(this.state.classes.values()).map(e=>e.content).join(`

`);this.styleElement._pendingContent=t}notifyObservers(){const t=o();if(t)try{t({classes:Array.from(this.state.classes.values()),lastModified:this.state.lastModified})}catch{}}getAllClasses(){return Array.from(this.state.classes.values())}getClass(t){return this.state.classes.get(t)}hasClass(t){return this.state.classes.has(t)}createClass(t,e){const s=this.state.classes.get(t);if(s)return s.content===e;const i=Date.now(),r={name:t,content:e,createdAt:i,updatedAt:i,isBuiltIn:!1};return this.state.classes.set(t,r),this.state.lastModified=i,this.updateStylesheet(),this.notifyObservers(),!0}updateClass(t,e){const s=this.state.classes.get(t);if(!s)return this.createClass(t,e);if(s.content===e)return!0;const i=Date.now(),r={...s,content:e,updatedAt:i};return this.state.classes.set(t,r),this.state.lastModified=i,this.updateStylesheet(),this.notifyObservers(),!0}removeClass(t){const e=this.state.classes.get(t);return!e||e.isBuiltIn?!1:(this.state.classes.delete(t),this.state.lastModified=Date.now(),this.updateStylesheet(),this.notifyObservers(),!0)}getClassNames(){return Array.from(this.state.classes.keys())}isLoaded(){return this.state.isLoaded}getLastModified(){return this.state.lastModified}},d=new l;typeof globalThis<"u"&&(globalThis.cssRegistry=d);export{d as c};
