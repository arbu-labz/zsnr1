// info_dnia_csharp.js
// Pula przekazów dnia – C# + XAML (egzamin, aplikacje mobilne/desktop)

const INFO_DNIA_CSHARP = [
    {
        id: 1,
        tag: "csharp",
        topic: "alert_po_kliknieciu",
        description: "Prosta obsługa kliknięcia przycisku z wyświetleniem komunikatu.",
        code: `private void OnKliknijMnieClicked(object sender, EventArgs e)
{
    DisplayAlert("Tytuł", "Treść wiadomości", "OK");
}`
    },
    {
        id: 2,
        tag: "csharp",
        topic: "pobieranie_tekstu_z_entry",
        description: "Pobieranie tekstu wpisanego przez użytkownika do zmiennej.",
        code: `string tekst = PoleEntry.Text;
if (tekst == null) tekst = string.Empty;`
    },
    {
        id: 3,
        tag: "csharp",
        topic: "sprawdzanie_switch",
        description: "Sprawdzanie, czy przełącznik jest włączony, i zapis do zmiennej.",
        code: `bool czyWlaczony = OpcjaSwitch.IsToggled;
WynikLabel.Text = czyWlaczony ? "Włączony" : "Wyłączony";`
    },
    {
        id: 4,
        tag: "csharp",
        topic: "dodawanie_liczb_z_entry",
        description: "Dodawanie dwóch liczb z pól tekstowych i wyświetlenie wyniku w etykiecie.",
        code: `double a = double.Parse(Liczba1Entry.Text);
double b = double.Parse(Liczba2Entry.Text);
WynikLabel.Text = $"Wynik: {a + b}";`
    },
    {
        id: 5,
        tag: "csharp",
        topic: "tryparse_walidacja",
        description: "Bezpieczne pobieranie liczby z pola tekstowego przy użyciu TryParse.",
        code: `if (double.TryParse(LiczbaEntry.Text, out double liczba))
    WynikLabel.Text = $"OK: {liczba}";
else
    WynikLabel.Text = "Błędna liczba";`
    },
    {
        id: 6,
        tag: "csharp",
        topic: "czyszczenie_pol",
        description: "Czyszczenie pola tekstowego i wyłączanie przełącznika.",
        code: `PoleEntry.Text = string.Empty;
OpcjaSwitch.IsToggled = false;
WynikLabel.Text = "";`
    },
    {
        id: 7,
        tag: "csharp",
        topic: "wyswietlanie_wyniku_label",
        description: "Wyświetlanie wyniku obliczeń w etykiecie z użyciem interpolacji.",
        code: `double wynik = 100;
WynikLabel.Text = $"Wynik: {wynik}";`
    },
    {
        id: 8,
        tag: "csharp",
        topic: "licznik_klikniec",
        description: "Licznik kliknięć przycisku wyświetlany w etykiecie.",
        code: `licznik++;
LicznikLabel.Text = $"Kliknięcia: {licznik}";`
    },
    {
        id: 9,
        tag: "csharp",
        topic: "ocena_warunek",
        description: "Klasyfikacja oceny wpisanej przez użytkownika.",
        code: `double ocena = double.Parse(OcenaEntry.Text);
if (ocena >= 4.5) WynikLabel.Text = "Bardzo dobry";
else if (ocena >= 3.0) WynikLabel.Text = "Zaliczono";
else WynikLabel.Text = "Nie zaliczono";`
    },
    {
        id: 10,
        tag: "csharp",
        topic: "petla_for_suma",
        description: "Suma liczb od 1 do n wpisanego przez użytkownika.",
        code: `int n = int.Parse(NEntry.Text);
int suma = 0;
for (int i = 1; i <= n; i++) suma += i;
WynikLabel.Text = $"Suma: {suma}";`
    },
    {
        id: 11,
        tag: "csharp",
        topic: "maksimum_w_tablicy",
        description: "Szukanie największej wartości w tablicy liczb.",
        code: `int max = a[0];
for (int i = 1; i < a.Length; i++)
    if (a[i] > max) max = a[i];
WynikLabel.Text = $"Max: {max}";`
    },
    {
        id: 12,
        tag: "csharp",
        topic: "zliczanie_dodatnich",
        description: "Zliczanie liczb dodatnich w tablicy.",
        code: `int licznikDodatnich = 0;
foreach (int x in a)
    if (x > 0) licznikDodatnich++;
WynikLabel.Text = $"Dodatnie: {licznikDodatnich}";`
    },
    {
        id: 13,
        tag: "csharp",
        topic: "linq_filtr_parzyste",
        description: "Filtrowanie liczb parzystych z listy przy użyciu LINQ.",
        code: `var parzyste = liczby.Where(x => x % 2 == 0).ToList();
WynikLabel.Text = $"Parzyste: {parzyste.Count}";`
    },
    {
        id: 14,
        tag: "csharp",
        topic: "sortowanie_rosnaco",
        description: "Sortowanie listy liczb rosnąco i wyświetlenie pierwszego elementu.",
        code: `liczby.Sort();
WynikLabel.Text = $"Najmniejsza: {liczby[0]}";`
    },
    {
        id: 15,
        tag: "csharp",
        topic: "losowanie_liczby",
        description: "Losowanie liczby od 1 do 6 (rzut kostką) i wyświetlenie wyniku.",
        code: `var rnd = new Random();
int oczka = rnd.Next(1, 7);
WynikLabel.Text = $"Wylosowano: {oczka}";`
    },
    {
        id: 16,
        tag: "csharp",
        topic: "datetime_dzisiaj",
        description: "Wyświetlanie dzisiejszej daty w etykiecie.",
        code: `DateTime dzis = DateTime.Today;
DataLabel.Text = dzis.ToString("dd.MM.yyyy");`
    },
    {
        id: 17,
        tag: "csharp",
        topic: "walidacja_pustego_pola",
        description: "Sprawdzanie, czy pole tekstowe jest puste przed obliczeniami.",
        code: `if (string.IsNullOrWhiteSpace(PoleEntry.Text))
    WynikLabel.Text = "Wpisz wartość";
else
    WynikLabel.Text = "OK";`
    },
    {
        id: 18,
        tag: "csharp",
        topic: "try_catch_parsowanie",
        description: "Obsługa błędu podczas parsowania liczby przy użyciu try-catch.",
        code: `try {
    double x = double.Parse(LiczbaEntry.Text);
    WynikLabel.Text = $"x = {x}";
} catch {
    WynikLabel.Text = "Błąd danych";
}`
    },
    {
        id: 19,
        tag: "csharp",
        topic: "czyszczenie_wielu_pol",
        description: "Czyszczenie kilku pól tekstowych jednym kliknięciem.",
        code: `ImieEntry.Text = "";
NazwiskoEntry.Text = "";
WynikLabel.Text = "";`
    },
    {
        id: 20,
        tag: "csharp",
        topic: "zmiana_koloru_label",
        description: "Zmiana koloru tekstu etykiety w zależności od wyniku.",
        code: `if (wynik < 0) {
    WynikLabel.TextColor = Colors.Red;
} else {
    WynikLabel.TextColor = Colors.Green;
}`
    },
    {
        id: 21,
        tag: "csharp",
        topic: "nawigacja_do_strony",
        description: "Przykład nawigacji do innej strony w aplikacji.",
        code: `await Navigation.PushAsync(new DrugaStrona());`
    },
    {
        id: 22,
        tag: "csharp",
        topic: "model_ucznia",
        description: "Prosta klasa modelu danych ucznia używana w aplikacji.",
        code: `class Uczen {
    public string Imie { get; set; }
    public int Punkty { get; set; }
}`
    },
    {
        id: 23,
        tag: "csharp",
        topic: "srednia_z_listy",
        description: "Obliczanie średniej z listy punktów uczniów.",
        code: `double sr = punkty.Average();
WynikLabel.Text = $"Średnia: {sr:F2}";`
    },
    {
        id: 24,
        tag: "csharp",
        topic: "filtr_ocen",
        description: "Filtrowanie listy uczniów z wynikiem powyżej progu.",
        code: `var zdali = uczniowie.Where(u => u.Punkty >= 50).ToList();
WynikLabel.Text = $"Zdali: {zdali.Count}";`
    },

    // --- XAML (mniejszość, ale ważna na egzaminie) ---

    {
        id: 25,
        tag: "csharp",
        topic: "xaml_label_podstawowa",
        description: "Etykieta XAML z dużym tekstem, wyśrodkowana poziomo.",
        code: `<Label Text="Witaj w aplikacji!"
       FontSize="Large"
       HorizontalOptions="Center" />`
    },
    {
        id: 26,
        tag: "csharp",
        topic: "xaml_label_blad",
        description: "Etykieta XAML z czerwonym tekstem błędu wyrównanym do lewej.",
        code: `<Label Text="Błąd!"
       FontSize="Small"
       TextColor="Red"
       HorizontalOptions="Start" />`
    },
    {
        id: 27,
        tag: "csharp",
        topic: "xaml_entry_haslo",
        description: "Pole tekstowe XAML, które ukrywa wpisywany tekst (tryb hasła).",
        code: `<Entry Placeholder="Wpisz hasło"
       IsPassword="True" />`
    },
    {
        id: 28,
        tag: "csharp",
        topic: "xaml_button_zdarzenie",
        description: "Przycisk XAML z tekstem i przypisaną metodą obsługi kliknięcia.",
        code: `<Button Text="Zaloguj"
        BackgroundColor="Green"
        Clicked="OnZalogujClicked" />`
    },
    {
        id: 29,
        tag: "csharp",
        topic: "xaml_grid_dwie_kolumny",
        description: "Siatka XAML z dwiema kolumnami: Auto i wypełnienie reszty.",
        code: `<Grid>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
</Grid>`
    },
    {
        id: 30,
        tag: "csharp",
        topic: "xaml_imie_entry_w_gridzie",
        description: "Etykieta i pole tekstowe w dwóch kolumnach siatki XAML.",
        code: `<Grid>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto" />
        <ColumnDefinition Width="*" />
    </Grid.ColumnDefinitions>
    <Label Text="Imię:" Grid.Column="0" />
    <Entry Placeholder="Wpisz imię" Grid.Column="1" />
</Grid>`
    }
];

// opcjonalnie wystawiamy globalnie
if (typeof window !== "undefined") {
    window.INFO_DNIA_CSHARP = INFO_DNIA_CSHARP;
}
