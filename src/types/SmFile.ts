
export class SmSongInfo
{
    title: string | null = null;
    titleTranslit: string | null = null;
    subtitle: string | null = null;
    subtitleTranslit: string | null = null;
    artist: string | null = null;
    artistTranslit: string | null = null;

    equals(other: SmSongInfo): boolean
    {
        return this.title === other.title && this.titleTranslit === other.titleTranslit
            && this.subtitle === other.subtitle && this.subtitleTranslit === other.subtitleTranslit
            && this.artist === other.artist && this.artistTranslit === other.artistTranslit;
    }
}