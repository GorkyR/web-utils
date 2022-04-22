import { Component, Input } from "@angular/core";



@Component({
   selector: 'busy',
   template: '<div class="loader" style="border-top: solid {{color}}; width: {{size}}px; height: {{size}}px; border-width: {{size * thickness}}px"></div>',
   styles: [
      `.loader {
         display: inline-block;
         margin-bottom: 4px;
         vertical-align: middle;
         border-style: solid;
         border-color: rgba(255, 255, 255, .05);
         border-radius: 50%;
         animation: spin .25s linear infinite;
      }
      
      @keyframes spin {
         0%   { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
      }`
   ]
})
export class BusyComponent {
   @Input() color = 'white';
   @Input() size = 14;
   @Input() thickness = .25;
}