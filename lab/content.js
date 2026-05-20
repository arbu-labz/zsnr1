const GAME_CONTENT = {
    cores: [
        {
            id: "r1",
            code: "Application.Current.MainPage = new ___();",
            correctWord: "AppShell"
        },
        {
            id: "r2",
            code: "<Label Text=\"Hello MAUI\" ___=\"Center\" />",
            correctWord: "HorizontalOptions"
        },
        {
            id: "r3",
            code: "<Button Text=\"Kliknij\" ___=\"OnClicked\" />",
            correctWord: "Clicked"
        },
        {
            id: "r4",
            code: "await DisplayAlert(\"Info\", \"Zapisano\", ___);",
            correctWord: "\"OK\""
        },
        {
            id: "r5",
            code: "<Entry Placeholder=\"Login\" ___=\"{Binding Login}\" />",
            correctWord: "Text"
        },
        {
            id: "r6",
            code: "<Image Source=\"logo.png\" ___=\"AspectFit\" />",
            correctWord: "Aspect"
        },
        {
            id: "r7",
            code: "public partial class MainPage : ___",
            correctWord: "ContentPage"
        },
        {
            id: "r8",
            code: "BindingContext = new ___();",
            correctWord: "MainViewModel"
        },
        {
            id: "r9",
            code: "<CollectionView ItemsSource=\"{Binding ___}\" />",
            correctWord: "Items"
        },
        {
            id: "r10",
            code: "Preferences.Set(\"theme\", ___);",
            correctWord: "\"dark\""
        }
    ],

    wordObjects: [
        { id: "m1", hiddenWord: "AppShell" },
        { id: "m2", hiddenWord: "HorizontalOptions" },
        { id: "m3", hiddenWord: "Clicked" },
        { id: "m4", hiddenWord: "\"OK\"" },
        { id: "m5", hiddenWord: "Text" },
        { id: "m6", hiddenWord: "Aspect" },
        { id: "m7", hiddenWord: "ContentPage" },
        { id: "m8", hiddenWord: "MainViewModel" },
        { id: "m9", hiddenWord: "Items" },
        { id: "m10", hiddenWord: "\"dark\"" }
    ]
};