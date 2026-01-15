import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: '<div class="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600 border-solid"></div>'
})
export class SpinnerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
