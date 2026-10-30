'use strict';
// UI translations. Bulgarian is the default; the choice is remembered per device.

const LS_LANG = 'cinelist.lang';
let LANG = localStorage.getItem(LS_LANG) === 'en' ? 'en' : 'bg';

const I18N = {
  bg: {
    'nav.towatch': 'За гледане', 'nav.watched': 'Гледани', 'nav.discover': 'Открий', 'nav.recommend': 'Препоръки', 'nav.settings': 'Настройки',
    'brand.pin': 'Закачи менюто да остава отворено',
    'filters': 'Филтри', 'addTitle': 'Добави заглавие', 'clear': 'Изчисти', 'close': 'Затвори', 'save': 'Запази', 'search': 'Търси',
    'loading': 'Зареждане...', 'refresh': 'Обнови',

    'view.towatch': 'За гледане', 'view.towatch.sub': 'Започнатите остават тук, докато не ги завършите',
    'view.watched': 'Гледани', 'view.watched.sub': 'Завършени заглавия — оценете от ★ до ★★★★★ (★★★ и повече = харесано)',
    'view.discover': 'Открий', 'view.discover.sub': 'Задайте критерии — заглавията се свалят автоматично с данни и рейтинг от IMDb',
    'view.recommend': 'Препоръки', 'view.recommend.sub': 'Подбрани според вашия вкус и рейтинга в IMDb',

    'f.search': 'Търси по заглавие, актьор, режисьор, жанр...', 'f.actor': 'Актьор', 'f.director': 'Режисьор', 'f.allGenres': 'Всички жанрове',
    'type.both': 'Филми и сериали', 'type.movies': 'Само филми', 'type.series': 'Само сериали',
    'progress.all': 'Започнати и незапочнати', 'progress.watching': 'Гледам в момента', 'progress.notstarted': 'Незапочнати', 'progress.new': 'С нов сезон',
    'opinion.all': 'Всички оценки', 'opinion.like': 'Харесани (★★★ и повече)', 'opinion.dislike': 'Нехаресани (★ – ★★)', 'opinion.none': 'Без оценка',
    'viewer.all': 'Всички зрители', 'viewer.none': 'Без отбелязано',
    'sort.added': 'Последно добавени', 'sort.rating': 'Най-висок рейтинг', 'sort.stars': 'Моята оценка', 'sort.year': 'Най-нови', 'sort.title': 'По заглавие',
    'shown': 'Показани {n} от {total}',

    'd.keyword': 'Ключова дума или поредица — напр. Star Wars, Marvel, Harry Potter, Batman',
    'd.actor': 'Актьор (напр. Tom Hanks)', 'd.director': 'Режисьор / създател', 'd.studio': 'Студио / платформа (Apple TV+, Disney+...)',
    'd.yearFrom': 'От година', 'd.yearTo': 'До година',
    'd.sort.popularity': 'Най-популярни', 'd.sort.rating': 'Най-високо оценени', 'd.sort.newest': 'Най-нови',
    'lang.any': 'Всеки език', 'lang.en': 'Английски', 'lang.bg': 'Български', 'lang.fr': 'Френски', 'lang.de': 'Немски', 'lang.es': 'Испански',
    'lang.it': 'Италиански', 'lang.ko': 'Корейски', 'lang.ja': 'Японски', 'lang.tr': 'Турски', 'lang.da': 'Датски', 'lang.sv': 'Шведски', 'lang.hi': 'Хинди',
    'd.loading': 'Търсене и зареждане на данни от IMDb...',
    'd.needTmdb.h': 'Нужен е TMDB ключ', 'd.needTmdb.p': 'Списъкът по критерии се взима от TMDB, а данните и рейтингът — от IMDb. Ключът е безплатен.', 'd.enterKey': 'Въведи ключ',
    'd.criteria.h': 'Задайте критерии', 'd.criteria.p': 'Въведете ключова дума или изберете жанр, актьор, режисьор, рейтинг или години и натиснете „Търси“.',
    'd.found': 'Намерени: {n}', 'd.owned': '{n} вече в списъците', 'd.addAll': 'Добави всички нови за гледане',
    'd.noResults.p': 'Разширете критериите — по-нисък рейтинг, повече жанрове или по-широк период.', 'd.more': 'Зареди още',

    'add.h': 'Добави филм или сериал', 'add.ph': 'Заглавие на английски или IMDb линк / ID (tt0111161)',
    'add.all': 'Всички', 'add.movies': 'Филми', 'add.series': 'Сериали',
    'add.hint': 'Започнете да пишете, за да търсите в IMDb.', 'add.min2': 'Въведете поне 2 символа.',

    'settings.h': 'Настройки', 'lang.toggle': 'Switch to English',
    'account.signedIn': 'Влезли сте като', 'account.sync': 'Списъците и ключовете се синхронизират между устройствата', 'signout': 'Изход',
    'omdb.label': 'OMDb API ключ (данни и рейтинги от IMDb)', 'omdb.ph': 'напр. a1b2c3d4',
    'omdb.help': 'Безплатен ключ: <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer">omdbapi.com/apikey.aspx</a> (избери FREE, потвърди от имейла).',
    'tmdb.label': 'TMDB API ключ (автоматично търсене по критерии)', 'tmdb.ph': 'API Key (v3) или Read Access Token',
    'tmdb.help': 'Безплатен ключ: регистрация в <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">themoviedb.org/settings/api</a>.',
    'settings.refresh': 'Обнови рейтингите', 'settings.seasons': 'Провери за нови сезони', 'settings.export': 'Експорт (JSON)',
    'settings.import': 'Импорт (JSON)', 'settings.clear': 'Изтрий всичко',

    'auth.google': 'Вход с Google', 'auth.note': 'Достъпът е само за разрешени акаунти.',
    'auth.deniedPre': 'Акаунтът', 'auth.deniedPost': 'няма достъп.', 'auth.switch': 'Изход и вход с друг акаунт',
    'auth.err.domain': 'Този адрес не е разрешен във Firebase (Authentication → Settings → Authorized domains).',
    'auth.err.network': 'Няма интернет връзка.', 'auth.err.tooMany': 'Твърде много опити — опитайте по-късно.',
    'auth.err.denied': 'Нямате достъп.', 'auth.err.generic': 'Грешка при вход',
    'cloud.syncError': 'Грешка при синхронизация: {msg}', 'cloud.syncStopped': 'Синхронизацията спря: {msg}', 'cloud.offline': 'Облакът е недостъпен — работите локално',

    'stats.watching': 'гледам в момента', 'stats.total': 'заглавия общо', 'stats.liked': 'харесани / нехаресани',
    'welcome.h': 'Добре дошли в W2W — What2Watch', 'welcome.p': 'За да вземаме данни и рейтинги от IMDb, въведете безплатен OMDb API ключ.', 'welcome.btn': 'Въведи API ключ',
    'empty.towatch.h': 'Списъкът е празен', 'empty.towatch.p': 'Добавете филми и сериали, които искате да гледате.',
    'empty.watched.h': 'Още няма гледани заглавия', 'empty.watched.p': 'Маркирайте заглавие като гледано или го оценете.',
    'noResults.h': 'Няма резултати', 'noResults.p': 'Опитайте с други филтри.', 'clearFilters': 'Изчисти филтрите',

    'type.movie': 'Филм', 'type.seriesOne': 'Сериал',
    'status.watched': 'В „Гледани“', 'status.watching': 'Гледам в момента', 'status.towatch': 'В „За гледане“',
    'badge.watching': '▶ Гледам', 'badge.new': 'Нов сезон',
    'stars.title': 'Моята оценка', 'stars.of': '{n} от 5',
    'season': 'Сезон', 'season.prev': 'Предишен сезон', 'season.next': 'Следващ сезон',
    'dir.short': 'Реж.:', 'viewers.label': 'Гледали:',
    'btn.toWatch': 'За гледане', 'btn.watchedIt': 'Гледах го', 'btn.delete': 'Изтрий',
    'btn.startTitle': 'Започнах да гледам', 'btn.pauseTitle': 'Пауза — не гледам в момента',
    'btn.finishTitle': 'Завърших — премести в Гледани', 'btn.moveBack': 'Премести в „За гледане“',
    'detail.start': 'Започнах', 'detail.pause': 'Пауза', 'detail.finish': 'Завърших',
    'detail.votes': 'гласа', 'detail.noPlot': 'Няма описание.', 'detail.creators': 'Създатели', 'detail.director': 'Режисьор',
    'detail.actors': 'Актьори', 'detail.watchedBy': 'Гледано от', 'detail.myRating': 'Моята оценка:', 'detail.comment': 'Коментар',
    'detail.commentPh': 'Какво ви хареса или не… (запазва се автоматично)', 'detail.imdb': 'Отвори в IMDb ↗',

    'reason.dir': 'Реж. {name}', 'reason.top': 'Топ рейтинг', 'reason.like': 'Като „{title}“',
    'rec.for': 'Препоръки за:', 'rec.everyone': 'Всички', 'rec.show': 'Покажи:', 'rec.movies': 'Филми', 'rec.series': 'Сериали',
    'rec.taste': 'Вашият вкус', 'rec.genres': 'Любими жанрове', 'rec.directors': 'Любими режисьори', 'rec.actors': 'Любими актьори', 'rec.noData': 'Още няма данни',
    'rec.rateHint': 'Оценете гледаните заглавия със звезди (★ до ★★★★★), за да станат препоръките лични. Дотогава подреждаме по рейтинг в IMDb.',
    'rec.because': 'Защото харесахте…', 'rec.needTmdb': 'Добавете TMDB ключ в Настройки, за да получавате заглавия, подобни на харесаните.',
    'rec.noLikedFor': 'Няма заглавия с ★★★ и повече, гледани от „{name}“.', 'rec.noLiked': 'Няма заглавия с ★★★ и повече.',
    'rec.onlyLiked': 'Предложения се дават само за заглавия, оценени с ★★★ или повече.',
    'rec.noneType': 'Няма предложения — оценете с ★★★ или повече заглавия от този вид.',
    'rec.next': 'Гледайте следващо', 'rec.fromList': 'от вашия списък', 'rec.noneInList': 'Няма заглавия от този вид в „За гледане“.',
    'rec.emptyList.h': 'Списъкът за гледане е празен', 'rec.emptyList.p': 'Добавете заглавия, за да получите препоръки.',
    'rec.new': 'Открийте нещо ново', 'rec.findTaste': 'Намери нови по моя вкус', 'rec.loadSeed': 'Зареди предложения от IMDb',
    'rec.noneKind': 'Няма заглавия от този вид.', 'rec.seedHint': 'Натиснете „Зареди предложения“, за да получите топ заглавия от IMDb, подредени според вашия вкус.',

    'err.noOmdb': 'Въведете OMDb API ключ в Настройки', 'err.notFound': 'Няма намерени резултати', 'err.badKey': 'Невалиден API ключ',
    'err.tooMany': 'Твърде много резултати — уточнете заглавието', 'err.limit': 'Достигнат дневен лимит на API ключа', 'err.request': 'Грешка при заявката',
    'err.noTmdb': 'Въведете TMDB API ключ в Настройки', 'err.badTmdb': 'Невалиден TMDB ключ', 'err.tmdb': 'TMDB грешка {code}',
    'err.person': 'Не е намерен човек с име „{name}“', 'err.studio': 'Не е намерено студио или платформа „{name}“',

    'toast.already': 'Вече е в списъка', 'toast.addedWatched': '„{title}“ е в Гледани — оценете го', 'toast.added': '„{title}“ е добавен за гледане',
    'toast.addedMany': 'Добавени {n} заглавия за гледане', 'toast.finished': '„{title}“ е завършен и преместен в Гледани',
    'toast.movedBack': '„{title}“ е преместен в „За гледане“', 'toast.notLoaded': '{n} заглавия не бяха заредени',
    'toast.needKeys': 'Нужни са TMDB и OMDb ключове', 'toast.refreshed': 'Обновени {ok} от {n} заглавия', 'toast.imported': 'Импортирани {n} заглавия',
    'toast.badFile': 'Невалиден файл', 'toast.cleared': 'Всички данни са изтрити', 'toast.noSeries': 'Няма гледани сериали за проверка',
    'toast.newSeason': 'Нов сезон: {list} — преместено в „За гледане“', 'toast.noNewSeasons': 'Няма нови сезони',
    'key.badTmdbFormat': 'Невалиден формат на TMDB ключа', 'key.tmdbOk': 'TMDB ключът е запазен и работи',
    'key.badFormat': 'Невалиден формат на ключа', 'key.omdbOk': 'OMDb ключът е запазен и работи',
    'refreshing': 'Обновяване {i}/{n}...',
    'confirm.remove': 'Да изтрия ли „{title}“?', 'confirm.clear': 'Сигурни ли сте, че искате да изтриете всички заглавия?'
  },

  en: {
    'nav.towatch': 'To watch', 'nav.watched': 'Watched', 'nav.discover': 'Discover', 'nav.recommend': 'For you', 'nav.settings': 'Settings',
    'brand.pin': 'Keep the menu open',
    'filters': 'Filters', 'addTitle': 'Add title', 'clear': 'Clear', 'close': 'Close', 'save': 'Save', 'search': 'Search',
    'loading': 'Loading...', 'refresh': 'Refresh',

    'view.towatch': 'To watch', 'view.towatch.sub': 'Started titles stay here until you finish them',
    'view.watched': 'Watched', 'view.watched.sub': 'Finished titles — rate from ★ to ★★★★★ (★★★ and up = liked)',
    'view.discover': 'Discover', 'view.discover.sub': 'Set your criteria — titles are fetched automatically with IMDb data and ratings',
    'view.recommend': 'For you', 'view.recommend.sub': 'Picked for your taste and the IMDb rating',

    'f.search': 'Search by title, actor, director, genre...', 'f.actor': 'Actor', 'f.director': 'Director', 'f.allGenres': 'All genres',
    'type.both': 'Movies & series', 'type.movies': 'Movies only', 'type.series': 'Series only',
    'progress.all': 'Started & not started', 'progress.watching': 'Watching now', 'progress.notstarted': 'Not started', 'progress.new': 'New season',
    'opinion.all': 'All ratings', 'opinion.like': 'Liked (★★★ and up)', 'opinion.dislike': 'Disliked (★ – ★★)', 'opinion.none': 'Not rated',
    'viewer.all': 'All viewers', 'viewer.none': 'Nobody marked',
    'sort.added': 'Recently added', 'sort.rating': 'Highest rated', 'sort.stars': 'My rating', 'sort.year': 'Newest', 'sort.title': 'By title',
    'shown': 'Showing {n} of {total}',

    'd.keyword': 'Keyword or franchise — e.g. Star Wars, Marvel, Harry Potter, Batman',
    'd.actor': 'Actor (e.g. Tom Hanks)', 'd.director': 'Director / creator', 'd.studio': 'Studio / platform (Apple TV+, Disney+...)',
    'd.yearFrom': 'From year', 'd.yearTo': 'To year',
    'd.sort.popularity': 'Most popular', 'd.sort.rating': 'Highest rated', 'd.sort.newest': 'Newest',
    'lang.any': 'Any language', 'lang.en': 'English', 'lang.bg': 'Bulgarian', 'lang.fr': 'French', 'lang.de': 'German', 'lang.es': 'Spanish',
    'lang.it': 'Italian', 'lang.ko': 'Korean', 'lang.ja': 'Japanese', 'lang.tr': 'Turkish', 'lang.da': 'Danish', 'lang.sv': 'Swedish', 'lang.hi': 'Hindi',
    'd.loading': 'Searching and loading IMDb data...',
    'd.needTmdb.h': 'A TMDB key is needed', 'd.needTmdb.p': 'The list comes from TMDB, the details and ratings from IMDb. The key is free.', 'd.enterKey': 'Enter key',
    'd.criteria.h': 'Set your criteria', 'd.criteria.p': 'Type a keyword or pick a genre, actor, director, rating or years and press "Search".',
    'd.found': 'Found: {n}', 'd.owned': '{n} already in your lists', 'd.addAll': 'Add all new ones to watch',
    'd.noResults.p': 'Widen the criteria — lower rating, more genres or a wider period.', 'd.more': 'Load more',

    'add.h': 'Add a movie or series', 'add.ph': 'English title or IMDb link / ID (tt0111161)',
    'add.all': 'All', 'add.movies': 'Movies', 'add.series': 'Series',
    'add.hint': 'Start typing to search IMDb.', 'add.min2': 'Type at least 2 characters.',

    'settings.h': 'Settings', 'lang.toggle': 'Премини на български',
    'account.signedIn': 'Signed in as', 'account.sync': 'Lists and keys are synced across your devices', 'signout': 'Sign out',
    'omdb.label': 'OMDb API key (IMDb data and ratings)', 'omdb.ph': 'e.g. a1b2c3d4',
    'omdb.help': 'Free key: <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer">omdbapi.com/apikey.aspx</a> (choose FREE, confirm by email).',
    'tmdb.label': 'TMDB API key (automatic search by criteria)', 'tmdb.ph': 'API Key (v3) or Read Access Token',
    'tmdb.help': 'Free key: sign up at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">themoviedb.org/settings/api</a>.',
    'settings.refresh': 'Refresh ratings', 'settings.seasons': 'Check for new seasons', 'settings.export': 'Export (JSON)',
    'settings.import': 'Import (JSON)', 'settings.clear': 'Delete everything',

    'auth.google': 'Sign in with Google', 'auth.note': 'Access is limited to approved accounts.',
    'auth.deniedPre': 'The account', 'auth.deniedPost': 'has no access.', 'auth.switch': 'Sign out and use another account',
    'auth.err.domain': 'This address is not authorised in Firebase (Authentication → Settings → Authorized domains).',
    'auth.err.network': 'No internet connection.', 'auth.err.tooMany': 'Too many attempts — try again later.',
    'auth.err.denied': 'You do not have access.', 'auth.err.generic': 'Sign-in error',
    'cloud.syncError': 'Sync error: {msg}', 'cloud.syncStopped': 'Sync stopped: {msg}', 'cloud.offline': 'Cloud unavailable — working locally',

    'stats.watching': 'watching now', 'stats.total': 'titles in total', 'stats.liked': 'liked / disliked',
    'welcome.h': 'Welcome to W2W — What2Watch', 'welcome.p': 'To get IMDb data and ratings, enter a free OMDb API key.', 'welcome.btn': 'Enter API key',
    'empty.towatch.h': 'Your list is empty', 'empty.towatch.p': 'Add movies and series you want to watch.',
    'empty.watched.h': 'No watched titles yet', 'empty.watched.p': 'Mark a title as finished or rate it.',
    'noResults.h': 'No results', 'noResults.p': 'Try different filters.', 'clearFilters': 'Clear filters',

    'type.movie': 'Movie', 'type.seriesOne': 'Series',
    'status.watched': 'In "Watched"', 'status.watching': 'Watching now', 'status.towatch': 'In "To watch"',
    'badge.watching': '▶ Watching', 'badge.new': 'New season',
    'stars.title': 'My rating', 'stars.of': '{n} of 5',
    'season': 'Season', 'season.prev': 'Previous season', 'season.next': 'Next season',
    'dir.short': 'Dir.:', 'viewers.label': 'Watched by:',
    'btn.toWatch': 'To watch', 'btn.watchedIt': 'Watched it', 'btn.delete': 'Delete',
    'btn.startTitle': 'Started watching', 'btn.pauseTitle': 'Pause — not watching now',
    'btn.finishTitle': 'Finished — move to Watched', 'btn.moveBack': 'Move to "To watch"',
    'detail.start': 'Started', 'detail.pause': 'Pause', 'detail.finish': 'Finished',
    'detail.votes': 'votes', 'detail.noPlot': 'No description.', 'detail.creators': 'Creators', 'detail.director': 'Director',
    'detail.actors': 'Cast', 'detail.watchedBy': 'Watched by', 'detail.myRating': 'My rating:', 'detail.comment': 'Comment',
    'detail.commentPh': 'What did you like or not… (saved automatically)', 'detail.imdb': 'Open on IMDb ↗',

    'reason.dir': 'Dir. {name}', 'reason.top': 'Top rated', 'reason.like': 'Like "{title}"',
    'rec.for': 'Recommendations for:', 'rec.everyone': 'Everyone', 'rec.show': 'Show:', 'rec.movies': 'Movies', 'rec.series': 'Series',
    'rec.taste': 'Your taste', 'rec.genres': 'Favourite genres', 'rec.directors': 'Favourite directors', 'rec.actors': 'Favourite actors', 'rec.noData': 'No data yet',
    'rec.rateHint': 'Rate titles with stars (★ to ★★★★★) to make recommendations personal. Until then they are sorted by IMDb rating.',
    'rec.because': 'Because you liked…', 'rec.needTmdb': 'Add a TMDB key in Settings to get titles similar to the ones you liked.',
    'rec.noLikedFor': 'No titles rated ★★★ or higher watched by "{name}".', 'rec.noLiked': 'No titles rated ★★★ or higher.',
    'rec.onlyLiked': 'Suggestions are based only on titles rated ★★★ or higher.',
    'rec.noneType': 'No suggestions — rate titles of this kind ★★★ or higher.',
    'rec.next': 'Watch next', 'rec.fromList': 'from your list', 'rec.noneInList': 'No titles of this kind in "To watch".',
    'rec.emptyList.h': 'Your watch list is empty', 'rec.emptyList.p': 'Add titles to get recommendations.',
    'rec.new': 'Discover something new', 'rec.findTaste': 'Find new ones for my taste', 'rec.loadSeed': 'Load suggestions from IMDb',
    'rec.noneKind': 'No titles of this kind.', 'rec.seedHint': 'Press "Load suggestions" to get top IMDb titles sorted by your taste.',

    'err.noOmdb': 'Enter an OMDb API key in Settings', 'err.notFound': 'No results found', 'err.badKey': 'Invalid API key',
    'err.tooMany': 'Too many results — be more specific', 'err.limit': 'Daily API key limit reached', 'err.request': 'Request failed',
    'err.noTmdb': 'Enter a TMDB API key in Settings', 'err.badTmdb': 'Invalid TMDB key', 'err.tmdb': 'TMDB error {code}',
    'err.person': 'No person named "{name}" found', 'err.studio': 'No studio or platform "{name}" found',

    'toast.already': 'Already in your list', 'toast.addedWatched': '"{title}" is in Watched — rate it', 'toast.added': '"{title}" added to watch',
    'toast.addedMany': 'Added {n} titles to watch', 'toast.finished': '"{title}" finished and moved to Watched',
    'toast.movedBack': '"{title}" moved to "To watch"', 'toast.notLoaded': '{n} titles could not be loaded',
    'toast.needKeys': 'TMDB and OMDb keys are required', 'toast.refreshed': 'Updated {ok} of {n} titles', 'toast.imported': 'Imported {n} titles',
    'toast.badFile': 'Invalid file', 'toast.cleared': 'All data deleted', 'toast.noSeries': 'No watched series to check',
    'toast.newSeason': 'New season: {list} — moved to "To watch"', 'toast.noNewSeasons': 'No new seasons',
    'key.badTmdbFormat': 'Invalid TMDB key format', 'key.tmdbOk': 'TMDB key saved and working',
    'key.badFormat': 'Invalid key format', 'key.omdbOk': 'OMDb key saved and working',
    'refreshing': 'Updating {i}/{n}...',
    'confirm.remove': 'Delete "{title}"?', 'confirm.clear': 'Are you sure you want to delete all titles?'
  }
};

const GENRE_BG = {
  Action: 'Екшън', Adventure: 'Приключенски', Animation: 'Анимация', Biography: 'Биографичен',
  Comedy: 'Комедия', Crime: 'Криминален', Documentary: 'Документален', Drama: 'Драма',
  Family: 'Семеен', Fantasy: 'Фентъзи', 'Film-Noir': 'Ноар', History: 'Исторически',
  Horror: 'Ужаси', Music: 'Музикален', Musical: 'Мюзикъл', Mystery: 'Мистерия',
  Romance: 'Романтичен', 'Sci-Fi': 'Фантастика', Sport: 'Спорт', Thriller: 'Трилър',
  War: 'Военен', Western: 'Уестърн', 'Reality-TV': 'Риалити', 'Talk-Show': 'Ток шоу',
  'Game-Show': 'Игрално шоу', News: 'Новини', Short: 'Късометражен'
};

// Viewer values are stored in Bulgarian; only their labels change
const VIEWER_LABELS = { 'Мариана': { en: 'Mariana' }, 'Ивайло': { en: 'Ivaylo' }, 'Семейно': { en: 'Family' } };

function t(key, vars = {}) {
  const s = I18N[LANG][key] ?? I18N.bg[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
const tg = g => (LANG === 'bg' && GENRE_BG[g]) || g;
const vl = v => VIEWER_LABELS[v]?.[LANG] || v;

function applyI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  // only our own dictionary strings (links in the settings help) go through innerHTML
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
    el.setAttribute('aria-label', el.title);
  });
  // text inputs in the list filters are as wide as their label
  document.querySelectorAll('#filters .filter-row input[placeholder]').forEach(el => { el.size = Math.max(6, el.placeholder.length + 2); });
}
