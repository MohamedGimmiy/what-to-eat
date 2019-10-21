import { Component } from '@angular/core';
import { MealdbApiService } from '../services/mealdb-api.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  meals$ = this.mealdb.meals$;
  constructor(private mealdb : MealdbApiService) {
    this.loadData();
  }

  loadData($event?){
    // take one will destroy the subscription once it is completed
    this.mealdb.getWhatToEat().pipe(take(1)).subscribe(
      done =>{
        if($event){
          $event.target.complete();
        }
      }
    );
  }
}
