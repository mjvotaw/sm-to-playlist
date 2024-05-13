
export class SmSongInfo
{
    title: string | null = null;
    titleTranslit: string | null = null;
    subtitle: string | null = null;
    subtitleTranslit: string | null = null;
    artist: string | null = null;
    artistTranslit: string | null = null;
    filepath: string = "";
    packName: string = "";
    equals(other: SmSongInfo): boolean
    {
        return this.title === other.title && this.titleTranslit === other.titleTranslit
            && this.subtitle === other.subtitle && this.subtitleTranslit === other.subtitleTranslit
            && this.artist === other.artist && this.artistTranslit === other.artistTranslit;
    }
}

const samples = [
    {
        "title": "ZZ",
        "titleTranslit": null,
        "subtitle": null,
        "subtitleTranslit": null,
        "artist": "D.J.Amuro",
        "artistTranslit": null,
        "filepath": "Sm-to-playlist Sample Songs/ZZ/ZZ.ssc",
        "packName": "Sm-to-playlist Sample Songs"
    },
    {
        "title": "シンデレラケージ",
        "titleTranslit": "Cinderella Cage",
        "subtitle": null,
        "subtitleTranslit": null,
        "artist": "xi-on",
        "artistTranslit": null,
        "filepath": "Sm-to-playlist Sample Songs/Cinderella Cage/Cinderella Cage.sm",
        "packName": "Sm-to-playlist Sample Songs"
    },
    {
        "title": "Tribal Trial",
        "titleTranslit": null,
        "subtitle": null,
        "subtitleTranslit": null,
        "artist": "Yooh",
        "artistTranslit": null,
        "filepath": "Sm-to-playlist Sample Songs/Tribal Trial/Tribal Trial.ssc",
        "packName": "Sm-to-playlist Sample Songs"
    },
    {
        "title": "SECRET BOSS",
        "titleTranslit": null,
        "subtitle": null,
        "subtitleTranslit": null,
        "artist": "かめりあ",
        "artistTranslit": null,
        "filepath": "Sm-to-playlist Sample Songs/SECRET BOSS/SECRET BOSS.sm",
        "packName": "Sm-to-playlist Sample Songs"
    },
    {
        "title": "Say So",
        "titleTranslit": null,
        "subtitle": "For Vincent",
        "subtitleTranslit": null,
        "artist": "Doja Cat",
        "artistTranslit": null,
        "filepath": "Sm-to-playlist Sample Songs/Say So/Say So.ssc",
        "packName": "Sm-to-playlist Sample Songs"
      }
];

export const getSampleSongs = (): SmSongInfo[] =>
{
    let simfiles: SmSongInfo[] = [];

    for (let sample of samples)
    {
        let simfile = new SmSongInfo();
        simfile.artist = sample.artist;
        simfile.artistTranslit = sample.artistTranslit;
        simfile.filepath = sample.filepath;
        simfile.packName = sample.packName;
        simfile.subtitle = sample.subtitle;
        simfile.subtitleTranslit = sample.subtitleTranslit;
        simfile.title = sample.title;
        simfile.titleTranslit = sample.titleTranslit;
        simfiles.push(simfile);
    }
    return simfiles;
}