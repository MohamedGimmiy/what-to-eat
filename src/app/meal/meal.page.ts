import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MealdbApiService } from '../services/mealdb-api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MealDB_MEAL } from '../services/model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-meal',
  templateUrl: './meal.page.html',
  styleUrls: ['./meal.page.scss'],
})
export class MealPage implements OnInit {
  id : string;
  meal$ : Observable<any>;
  ingredients;
  instructions;
  constructor(private _activateRoute : ActivatedRoute,
              private _mealdb : MealdbApiService,

              // sanitizer is used to prevent CORS errors :D yaaaaaaa
              private sanitizer : DomSanitizer) {
    this.id = _activateRoute.snapshot.paramMap.get('id');
    // tap operator is used to console log the source observable returned as an object :D 
    this.meal$ = this._mealdb.getMealById(this.id).pipe(
      tap(meal=> {
        console.log(meal);
        this.ingredients =  this.getIngredientsArray(meal);
        this.instructions = this.convertInstructionToArray(meal);
      })
    );
   }

  ngOnInit() {
  }
  getYoutubeLink(meal : MealDB_MEAL){
    const id = meal.strYoutube.split('=')[1];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`http://www.youtube.com/embed/${id}?enablejsapi=1&origin=http://example.com`);
  }

  getIngredientsArray(meal: MealDB_MEAL){
    const results = [];
    for(let i =1; i <=20 ; i++){
      results.push([meal['strIngredient' + i], meal['strMeasure' + i]]);
    }
    console.log(results)
    // removing the first element of 0
    //console.log(results.filter(i => !!i[0]));
    return results.filter(i => !!i[0]);
  }

  convertInstructionToArray(meal : MealDB_MEAL){
    // trim removes the empty spaces :D
    return meal.strInstructions.split('\n').filter(i => i.trim());
  }
}
