import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    SearchRequest,
    TagSection,
    HomeSectionRequest,
} from 'paperback-extensions-common';

export class ReaperScans extends Source {
    constructor() {
        super({
            version: '1.0.0',
            name: 'Reaper Scans',
            icon: 'icon.png', // Add an appropriate icon file if needed
            author: 'YourName',
            websiteBaseURL: 'https://reaperscans.com',
            language: 'English',
            sourceTags: [{ text: 'Free', type: TagSection.Type.INFO }],
        });
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const url = `${this.baseUrl}/series/${mangaId}`;
        const response = await this.requestManager.schedule({
            url: url,
            method: 'GET',
        }, 1);

        const $ = this.cheerio.load(response.data);

        return createManga({
            id: mangaId,
            titles: [$('.series-title h1').text()],
            image: $('.series-cover img').attr('src') ?? '',
            author: $('li:contains(Author)').find('a').text(),
            artist: $('li:contains(Artist)').find('a').text(),
            description: $('.series-summary').text(),
            status: $('li:contains(Status)').text().includes('Ongoing') ? 'ONGOING' : 'COMPLETED',
        });
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const url = `${this.baseUrl}/series/${mangaId}`;
        const response = await this.requestManager.schedule({
            url: url,
            method: 'GET',
        }, 1);

        const $ = this.cheerio.load(response.data);
        const chapters: Chapter[] = [];

        $('.chapter-list a').each((_, element) => {
            const id = $(element).attr('href')?.split('/').pop() ?? '';
            const name = $(element).find('.chapter-title').text();
            const time = new Date($(element).find('.chapter-date').text()).getTime();

            chapters.push(createChapter({
                id,
                mangaId,
                name,
                time,
            }));
        });

        return chapters;
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const url = `${this.baseUrl}/reader/${chapterId}`;
        const response = await this.requestManager.schedule({
            url: url,
            method: 'GET',
        }, 1);

        const $ = this.cheerio.load(response.data);
        const pages: string[] = [];

        $('.reader-img img').each((_, element) => {
            pages.push($(element).attr('src') ?? '');
        });

        return createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }

    async searchRequest(query: SearchRequest): Promise<Manga[]> {
        const searchUrl = `${this.baseUrl}/search?query=${encodeURIComponent(query.title ?? '')}`;
        const response = await this.requestManager.schedule({
            url: searchUrl,
            method: 'GET',
        }, 1);

        const $ = this.cheerio.load(response.data);
        const mangas: Manga[] = [];

        $('.search-results .result').each((_, element) => {
            const id = $(element).find('a').attr('href')?.split('/').pop() ?? '';
            const title = $(element).find('.result-title').text();
            const image = $(element).find('img').attr('src') ?? '';

            mangas.push(createManga({
                id,
                titles: [title],
                image,
            }));
        });

        return mangas;
    }
}
