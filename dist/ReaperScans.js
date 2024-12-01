"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReaperScans = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class ReaperScans extends paperback_extensions_common_1.Source {
    constructor() {
        super({
            version: '1.0.0',
            name: 'Reaper Scans',
            icon: 'icon.png', // Add an appropriate icon file if needed
            author: 'YourName',
            websiteBaseURL: 'https://reaperscans.com',
            language: 'English',
            sourceTags: [{ text: 'Free', type: paperback_extensions_common_1.TagSection.Type.INFO }],
        });
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const url = `${this.baseUrl}/series/${mangaId}`;
            const response = yield this.requestManager.schedule({
                url: url,
                method: 'GET',
            }, 1);
            const $ = this.cheerio.load(response.data);
            return createManga({
                id: mangaId,
                titles: [$('.series-title h1').text()],
                image: (_a = $('.series-cover img').attr('src')) !== null && _a !== void 0 ? _a : '',
                author: $('li:contains(Author)').find('a').text(),
                artist: $('li:contains(Artist)').find('a').text(),
                description: $('.series-summary').text(),
                status: $('li:contains(Status)').text().includes('Ongoing') ? 'ONGOING' : 'COMPLETED',
            });
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}/series/${mangaId}`;
            const response = yield this.requestManager.schedule({
                url: url,
                method: 'GET',
            }, 1);
            const $ = this.cheerio.load(response.data);
            const chapters = [];
            $('.chapter-list a').each((_, element) => {
                var _a, _b;
                const id = (_b = (_a = $(element).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
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
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}/reader/${chapterId}`;
            const response = yield this.requestManager.schedule({
                url: url,
                method: 'GET',
            }, 1);
            const $ = this.cheerio.load(response.data);
            const pages = [];
            $('.reader-img img').each((_, element) => {
                var _a;
                pages.push((_a = $(element).attr('src')) !== null && _a !== void 0 ? _a : '');
            });
            return createChapterDetails({
                id: chapterId,
                mangaId,
                pages,
            });
        });
    }
    searchRequest(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const searchUrl = `${this.baseUrl}/search?query=${encodeURIComponent((_a = query.title) !== null && _a !== void 0 ? _a : '')}`;
            const response = yield this.requestManager.schedule({
                url: searchUrl,
                method: 'GET',
            }, 1);
            const $ = this.cheerio.load(response.data);
            const mangas = [];
            $('.search-results .result').each((_, element) => {
                var _a, _b, _c;
                const id = (_b = (_a = $(element).find('a').attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
                const title = $(element).find('.result-title').text();
                const image = (_c = $(element).find('img').attr('src')) !== null && _c !== void 0 ? _c : '';
                mangas.push(createManga({
                    id,
                    titles: [title],
                    image,
                }));
            });
            return mangas;
        });
    }
}
exports.ReaperScans = ReaperScans;
