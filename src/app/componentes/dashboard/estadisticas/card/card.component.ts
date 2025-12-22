import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: []
})
export class CardComponent implements OnInit {
  @Input() titulo!: string;

  @Input() icon: string = '';

  @Input() valor!: any;
  constructor() { }

  ngOnInit() {
  }

}
