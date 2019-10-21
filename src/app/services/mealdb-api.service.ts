import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { MEALDB_Category, MEALDB_ListItem, MealDB_MEAL } from './model';
export const MEALDB_API ={
  ROOT : 'https://www.themealdb.com/api/json/v1/1/',
  get FILTER(){
    return this.ROOT + 'filter.php';
  },
  get LOOKUP(){
    return this.ROOT + 'lookup.php';
  }
}



@Injectable({
  providedIn: 'root'
})
export class MealdbApiService {

  usedIds = new Set();
  // it is just an observable that has an initial value
  meals$ : BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private http: HttpClient) {

   }

   getMealById( id : string) : Observable<MealDB_MEAL>{
    return this.http.get(`${MEALDB_API.LOOKUP}?i=${id}`).pipe(
      map((res : {meals : MealDB_MEAL[]}) => res.meals[0]));
    
   }
   getWhatToEat() : Observable<void>{
     // get the keys of an object as an array
    const categoryAsArray = Object.keys(MEALDB_Category).map(i => MEALDB_Category[i]);
    const eightCategories = this._randomFromArray(categoryAsArray,8);
    console.log('eightCategories', eightCategories);

    // for each category  we are getting meals of it
    const arrayOfHttpCalls = eightCategories.map( category => this.getMealsByCategory(category));
    console.log('arrayOfHttpCalls',arrayOfHttpCalls);
    // forkJoin are going to wait for all http calls to be completed
     return forkJoin(arrayOfHttpCalls).pipe(
      map( (res : MEALDB_ListItem[]) => {
        // [].concat(res)
        console.log("response from httpcalls", res)
        this.meals$.next(this.meals$.getValue().concat(res)); // like i ++ and adding values into array
      })
    );
   }

   private _randomFromArray(array, times = 1){
     const results = [];
     for(let i=0; i<times;i++){
       // choosing a random category from our categories
       const randomIndex = Math.floor(Math.random() * array.length);
       results.push(array[randomIndex]);
     }
     return results;
   }

   // getting meals by category
   getMealsByCategory(category: string) : Observable<MEALDB_ListItem>{
     return this.http
          .get(`${MEALDB_API.FILTER}?c=${category}`)
          .pipe( // getting rid of object and returning an array :D 
            map( (res: any) => {
              if(res.meals){
                let count = 0;
                let results;
                // check if meal duplicated or unique then its id is put into a set
                while((!results || !results.strMealThumb || this.usedIds.has(results.idMeal)) && count <5){
                  results = this._randomFromArray(res.meals)[0];
                  count ++;
                }
                this.usedIds.add(results.idMeal);
                return this._randomFromArray(res.meals)[0]; // we need only one meal from this category
              }
              })
     );
   }
}
