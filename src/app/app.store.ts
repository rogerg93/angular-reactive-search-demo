import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Article } from './interfaces/news.interface';
import { NewsApiService } from './services/news-api.service';
import {
  EMPTY,
  Observable,
  catchError,
  debounceTime,
  switchMap,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface AppState {
  articles: Article[];
  articlesError: string | null;
}

@Injectable()
export class AppStore extends ComponentStore<AppState> {
  private readonly articles$ = this.select((state) => state.articles);
  private readonly articlesError$ = this.select((state) => state.articlesError);

  readonly vm$ = this.select({
    articles: this.articles$,
    articlesError: this.articlesError$,
  });

  readonly getArticles = this.effect((searchQuery$: Observable<string>) => {
    return searchQuery$.pipe(
      debounceTime(500),
      switchMap((searchQuery) => {
        if (!searchQuery) {
          this.patchState({ articles: [], articlesError: null });
          return EMPTY;
        } else {
          return this.newsApiService.getArticles$(searchQuery).pipe(
            tapResponse(
              (articles) => this.patchState({ articles, articlesError: null }),
              (error: HttpErrorResponse) =>
                this.patchState({ articles: [], articlesError: error.message })
            )
          );
        }
      })
    );
  });

  constructor(private newsApiService: NewsApiService) {
    super({
      articles: [],
      articlesError: null,
    });
  }
}
