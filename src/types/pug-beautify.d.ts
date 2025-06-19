declare module 'pug-beautify' {
  export interface BeautifyOptions {
    fill_tab?: boolean;
    omit_div?: boolean;
    tab_size?: number;
  }
  
  export default function pugBeautify(text: string, options: BeautifyOptions): string;
}
