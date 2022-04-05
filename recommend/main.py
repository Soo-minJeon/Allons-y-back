import sys
import numpy as np
import pandas as pd # pandas
from sklearn.metrics.pairwise import cosine_similarity

def process(id):
    # row, col 생략 없이 출력
    pd.set_option('display.max_rows', None)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 300)

    ### 필요한 함수와 알고리즘 구현부
    ratings = pd.read_csv(
        'recommend/ratings_small.csv',
        low_memory=False)
    movies = pd.read_csv(
        'recommend/movies_metadata.csv',
        low_memory=False)
    movies.columns = ['adult', 'belongs_to_collection', 'budget', 'genres', 'homepage', 'movieId', 'imdb_id',
                      'original_language', 'original_title', 'overview', 'popularity', 'poster_path',
                      'production_companies', 'production_countries', 'release_date', 'revenue', 'runtime',
                      'spoken_languages', 'status', 'tagline',
                      'title', 'video', 'vote_average', 'vote_count']

    movies.movieId = pd.to_numeric(movies.movieId, errors='coerce')
    ratings.movieId = pd.to_numeric(ratings.movieId, errors='coerce')

    movie_ratings = pd.merge(ratings, movies, on="movieId")

    ################################################
    ## 맨 첫 파라미터(rating - 수행모델 결과로 수정해야 함.)##
    ################################################
    title_user = movie_ratings.pivot_table('rating', index='userId', columns='movieId')
    # 결측치는 0으로 처리
    title_user.fillna(0, inplace=True)

    # 유저와 유저 간의 유사도
    user_based_collab = cosine_similarity(title_user, title_user)
    user_based_collab = pd.DataFrame(user_based_collab, index=title_user.index, columns=title_user.index)

    # 대상이 되는 유저의 id
    # client_user = int(id)
    client_user = int(1)

    #
    recommend_user = 5
    users = []
    movieid = []

    # 가장 유사도가 높은 유저의 감상기록 가져오기
    for i in range(1, recommend_user+1):
        user = user_based_collab[client_user].sort_values(ascending=False)[:10].index[i]
        user2 = (title_user.loc[user].sort_values(ascending=False))
        users.append(user)
        movieid.append(user2.head(5).index.values)

    print(users, movieid)

if __name__ == '__main__':
    process(sys.argv[1])

