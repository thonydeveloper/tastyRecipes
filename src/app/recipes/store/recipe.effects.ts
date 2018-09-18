import { Injectable } from '@angular/core';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { Effect, Actions } from '@ngrx/effects';
import * as RecipeActions from '../store/recipe.actions';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRecipe from '../store/recipe.reducers';

@Injectable()
export class RecipeEffects {
    @Effect()
    recipeFetch = this.actions$
        .ofType(RecipeActions.FETCH_RECIPES)
        .pipe(switchMap((action: RecipeActions.FetchRecipes) => {
            return this.httpClient.get<Recipe[]>('https://ng-recipe-book-e6530.firebaseio.com/recipes.json')
        }),
        map(
            (recipes) => {
                for (const recipe of recipes) {
                    if (!recipe['ingredients']) {
                        console.log(recipe);
                        recipe['ingredients'] = [];
                    }
                }
                return {
                    type: RecipeActions.SET_RECIPES,
                    payload: recipes
                };
            }
        ));
        

    @Effect({dispatch: false})
    recipeStore = this.actions$
        .ofType(RecipeActions.STORE_RECIPES)
        .pipe(withLatestFrom(this.store.select('recipes')), 
            switchMap(([action, state]) => {
                return this.httpClient.put(
                    'https://ng-recipe-book-e6530.firebaseio.com/recipes.json',
                    state.recipes
                );
            }));

    constructor(private actions$: Actions, private httpClient: HttpClient, private store: Store<fromRecipe.FeatureState>) {}
}

