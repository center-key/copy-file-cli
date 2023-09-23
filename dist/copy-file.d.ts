//! copy-file-util v1.1.2 ~~ https://github.com/center-key/copy-file-util ~~ MIT License

export type Settings = {
    cd: string;
    targetFile: string;
    targetFolder: string;
    fileExtension: string;
    move: boolean;
};
export type Result = {
    origin: string;
    dest: string;
    duration: number;
    moved: boolean;
};
declare const copyFile: {
    cp(sourceFile: string, options?: Partial<Settings>): Result;
    reporter(result: Result): Result;
};
export { copyFile };
