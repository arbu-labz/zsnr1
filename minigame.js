// minigame.js – sekwencja potasowanych mini-gier bez powtórek
// po złej odpowiedzi: reset XP i nowa permutacja
(function () {
    function $(id) {
        return document.getElementById(id);
    }

    var XP_KEY = "mch_xp_points";
    var xpValue = 0;
    var xpDisplay = null;
    var gameRoot = null;

    var games = [];
    var order = [];        // np. [5, 2, 0, 7, ...]
    var orderPos = 0;      // który indeks w order aktualnie
    var solvedInSeries = 0;      // ile gier z rzędu odgadniętych w tej serii
    var xpStatusEl = null;       // element z napisem "ZŁOTA SERIA"
    // ----- XP -----
    function loadXP() {
        var stored = 0;
        try {
            stored = parseInt(window.localStorage.getItem(XP_KEY), 10);
            if (isNaN(stored)) stored = 0;
        } catch (e) {
            stored = 0;
        }
        xpValue = stored;
    }

    function saveXP() {
        try {
            window.localStorage.setItem(XP_KEY, String(xpValue));
        } catch (e) {
            // ignore
        }
    }

    function updateXPDisplay() {
        if (xpDisplay) {
            xpDisplay.textContent = String(xpValue);
        }
    }

    function addXP(points) {
        xpValue += points;
        if (xpValue < 0) xpValue = 0;
        saveXP();
        updateXPDisplay();
    }

    function resetXP() {
        xpValue = 0;
        saveXP();
        updateXPDisplay();
    }

    function refreshGoldenStatus() {
        if (!xpStatusEl) return;
        if (games.length > 0 && solvedInSeries >= games.length) {
            xpStatusEl.textContent = "ZŁOTA SERIA";
        } else {
            xpStatusEl.textContent = "";
        }
    }
    // ----- KOLEJNOŚĆ GIER -----

    // buduje nową potasowaną listę indeksów 0..games.length-1
    function buildNewOrder() {
        order = [];
        for (var i = 0; i < games.length; i++) {
            order.push(i);
        }
        // Fisher–Yates shuffle
        for (var j = order.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var tmp = order[j];
            order[j] = order[k];
            order[k] = tmp;
        }
    }

    function loadGameFromOrder() {
        if (!gameRoot || games.length === 0) return;

        if (order.length !== games.length) {
            buildNewOrder();
            orderPos = 0;
        }
        if (orderPos < 0 || orderPos >= order.length) {
            orderPos = 0;
        }
        var gameIndex = order[orderPos];
        gameRoot.innerHTML = "";
        games[gameIndex](gameRoot);
    }

    function loadNextGameInSequence() {
        if (games.length === 0) return;

        // nowa poprawna odpowiedź w tej serii
        solvedInSeries++;
        if (solvedInSeries > games.length) {
            solvedInSeries = games.length;
        }
        refreshGoldenStatus();

        orderPos++;
        if (orderPos >= order.length) {
            // ukończona cała seria – tasujemy nową, ale ZŁOTA SERIA zostaje,
            // dopóki się nie pomylą
            buildNewOrder();
            orderPos = 0;
        }
        loadGameFromOrder();
    }

    function restartSequenceFromScratch() {
        if (games.length === 0) return;
        solvedInSeries = 0;
        refreshGoldenStatus();
        buildNewOrder();
        orderPos = 0;
        loadGameFromOrder();
    }

    // ----- BUDOWNICZE GIER -----

    // Gra z polem tekstowym
    function createTextInputGame(config) {
        return function (container) {
            var html = "";
            html += '<div class="mch-code">' + config.codeHtml + "</div>";
            html += '<div class="mch-question">' + config.questionHtml + "</div>";
            html += '<div class="mch-input-row">';
            html +=
                '<input type="text" class="mch-text-input" id="' +
                config.id +
                '-input" placeholder="' +
                (config.placeholder || "wpisz odpowiedź...") +
                '" />';
            html +=
                '<button class="mch-btn" id="' +
                config.id +
                '-btn">Sprawdź</button>';
            html += "</div>";
            html +=
                '<div class="mch-feedback" id="' + config.id + '-feedback"></div>';

            container.innerHTML = html;

            var input = $(config.id + "-input");
            var btn = $(config.id + "-btn");
            var feedback = $(config.id + "-feedback");

            function normalize(val) {
                var v = String(val);
                if (config.trimWhitespace !== false) {
                    v = v.replace(/\s+/g, "");
                }
                if (config.caseInsensitive) {
                    v = v.toLowerCase();
                }
                return v;
            }

            function isCorrect(val) {
                var norm = normalize(val);
                for (var i = 0; i < config.correctAnswers.length; i++) {
                    var candidate = normalize(config.correctAnswers[i]);
                    if (norm === candidate) return true;
                }
                return false;
            }

            function check() {
                if (!input || !feedback) return;
                var raw = input.value;
                var trimmed = String(raw).replace(/\s+/g, "");

                if (trimmed === "") {
                    feedback.className = "mch-feedback err";
                    feedback.textContent =
                        config.emptyMessage || "Podaj jakąś odpowiedź 🙂";
                    resetXP();
                    input.value = "";
                    setTimeout(restartSequenceFromScratch, 1200);
                    return;
                }

                if (isCorrect(raw)) {
                    feedback.className = "mch-feedback ok";
                    feedback.innerHTML =
                        config.correctMessage +
                        '<span class="mch-xp-popup">+1 XP ✨</span>';
                    addXP(1);
                    if (btn) btn.disabled = true;
                    if (input) {
                        input.disabled = true;
                        input.value = "";
                    }
                    setTimeout(loadNextGameInSequence, 1200);
                } else {
                    feedback.className = "mch-feedback err";
                    feedback.innerHTML =
                        config.wrongMessage ||
                        "To nie ta odpowiedź. Spróbuj jeszcze raz 🙂";
                    resetXP();
                    if (input) input.value = "";
                    setTimeout(restartSequenceFromScratch, 1200);
                }
            }

            if (btn) {
                btn.onclick = check;
            }
            if (input) {
                input.onkeydown = function (e) {
                    e = e || window.event;
                    if (e.key === "Enter" || e.keyCode === 13) {
                        check();
                    }
                };
            }
        };
    }

    // Gra jednokrotnego wyboru (A/B/C/…)
    function createMcqGame(config) {
        return function (container) {
            var html = "";
            html += '<div class="mch-code">' + config.codeHtml + "</div>";
            html += '<div class="mch-question">' + config.questionHtml + "</div>";

            html += '<div class="mch-options">';
            for (var i = 0; i < config.options.length; i++) {
                var opt = config.options[i];
                html +=
                    '<label><input type="radio" name="' +
                    config.id +
                    '-mcq" value="' +
                    opt.value +
                    '" /> ' +
                    opt.label +
                    "</label>";
            }
            html += "</div>";

            html += '<div class="mch-input-row" style="margin-top:0.5rem;">';
            html +=
                '<button class="mch-btn" id="' +
                config.id +
                '-btn">Sprawdź</button>';
            html += "</div>";
            html +=
                '<div class="mch-feedback" id="' + config.id + '-feedback"></div>';

            container.innerHTML = html;

            var btn = $(config.id + "-btn");
            var feedback = $(config.id + "-feedback");

            function check() {
                var radios = document.getElementsByName(config.id + "-mcq");
                var chosen = "";
                var i;
                for (i = 0; i < radios.length; i++) {
                    if (radios[i].checked) {
                        chosen = radios[i].value;
                        break;
                    }
                }

                if (!feedback) return;

                if (!chosen) {
                    feedback.className = "mch-feedback err";
                    feedback.textContent =
                        config.emptyMessage || "Zaznacz jedną z odpowiedzi 🙂";
                    resetXP();
                    setTimeout(restartSequenceFromScratch, 1200);
                    return;
                }

                if (chosen === config.correctValue) {
                    feedback.className = "mch-feedback ok";
                    feedback.innerHTML =
                        config.correctMessage +
                        '<span class="mch-xp-popup">+1 XP ✨</span>';
                    addXP(1);
                    if (btn) btn.disabled = true;
                    for (i = 0; i < radios.length; i++) {
                        radios[i].disabled = true;
                    }
                    setTimeout(loadNextGameInSequence, 1200);
                } else {
                    feedback.className = "mch-feedback err";
                    feedback.innerHTML =
                        config.wrongMessage ||
                        "To nie ta odpowiedź. Spróbuj jeszcze raz 🙂";
                    resetXP();
                    // wyczyszczenie wyboru
                    for (i = 0; i < radios.length; i++) {
                        radios[i].checked = false;
                    }
                    setTimeout(restartSequenceFromScratch, 1200);
                }
            }

            if (btn) {
                btn.onclick = check;
            }
        };
    }

    // ----- 20 KONKRETNYCH MINI-GIER (jak poprzednio) -----
    // 1. x += 3
    games.push(
        createTextInputGame({
            id: "g1_x_plus_eq",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Co wypisze ten program?</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">4</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">+=</span> <span class="mch-line-number">3</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">x</span>)</span>',
            questionHtml: "Jaki wynik pojawi się w konsoli?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["7"],
            correctMessage: "✅ Poprawnie! 4 + 3 = 7.",
            wrongMessage:
                "❌ Nie do końca. Operator <code>+=</code> dodaje liczbę do istniejącej wartości."
        })
    );

    // 2. range(3)
    games.push(
        createTextInputGame({
            id: "g2_range_3",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Uzupełnij, aby wypisać liczby 0, 1, 2</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-str">___</span>):</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>',
            questionHtml:
                "Jaką liczbę należy wpisać w miejsce <code>___</code>, aby wypisać 0, 1 i 2?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["3"],
            correctMessage: "✅ Tak! <code>range(3)</code> daje 0, 1, 2.",
            wrongMessage:
                "❌ Jeszcze nie. <code>range(n)</code> generuje liczby od 0 do n-1."
        })
    );

    // 3. len listy po append
    games.push(
        createTextInputGame({
            id: "g3_list_append",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Jaka będzie długość listy?</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span>.<span class="mch-line-func">append</span>(<span class="mch-line-number">5</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">len</span>(<span class="mch-line-var">dane</span>))</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["3"],
            correctMessage:
                "✅ Były 2 elementy, po <code>append(5)</code> jest ich 3.",
            wrongMessage:
                "❌ Pamiętaj: <code>append</code> dodaje jeden element na koniec listy."
        })
    );

    // 4. len("arbuz")
    games.push(
        createTextInputGame({
            id: "g4_len_string",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Długość napisu</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">s</span> <span class="mch-line-keyword">=</span> <span class="mch-line-str">"arbuz"</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">len</span>(<span class="mch-line-var">s</span>))</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["5"],
            correctMessage:
                "✅ Napis <code>\"arbuz\"</code> ma 5 znaków.",
            wrongMessage:
                "❌ Policz litery w napisie <code>\"arbuz\"</code> jeszcze raz."
        })
    );

    // 5. potęgowanie 2**3
    games.push(
        createTextInputGame({
            id: "g5_power",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Potęgowanie</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-number">2</span> <span class="mch-line-keyword">**</span> <span class="mch-line-number">3</span>)</span>',
            questionHtml: "Jaki wynik wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["8"],
            correctMessage: "✅ 2 do potęgi 3 to 8.",
            wrongMessage:
                "❌ W Pythonie <code>**</code> to potęgowanie: 2×2×2."
        })
    );

    // 6. int("7") + 1
    games.push(
        createTextInputGame({
            id: "g6_int_input",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Konwersja napisu na liczbę</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">int</span>(<span class="mch-line-str">"7"</span>) <span class="mch-line-keyword">+</span> <span class="mch-line-number">1</span>)</span>',
            questionHtml: "Jaki wynik wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["8"],
            correctMessage:
                "✅ Napis \"7\" zamieniamy na liczbę 7, dodajemy 1 i mamy 8.",
            wrongMessage:
                "❌ Funkcja <code>int()</code> zmienia napis na liczbę całkowitą."
        })
    );

    // 7. modulo
    games.push(
        createTextInputGame({
            id: "g7_modulo",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Reszta z dzielenia</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-number">10</span> <span class="mch-line-keyword">%</span> <span class="mch-line-number">3</span>)</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["1"],
            correctMessage:
                "✅ 10 = 3⋅3 + 1, więc reszta z dzielenia to 1.",
            wrongMessage:
                "❌ Operator <code>%</code> zwraca resztę z dzielenia."
        })
    );

    // 8. wyrażenie logiczne
    games.push(
        createTextInputGame({
            id: "g8_bool_expr",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Wyrażenie logiczne</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>((<span class="mch-line-number">3</span> <span class="mch-line-keyword">&gt;</span> <span class="mch-line-number">1</span>) <span class="mch-line-keyword">and</span> (<span class="mch-line-number">2</span> <span class="mch-line-keyword">&lt;</span> <span class="mch-line-number">1</span>))</span>',
            questionHtml: "Co wypisze program? (True czy False?)",
            placeholder: "True / False",
            correctAnswers: ["False", "false"],
            caseInsensitive: true,
            correctMessage:
                "✅ Pierwsza część jest prawdziwa, druga fałszywa, więc całość to False.",
            wrongMessage:
                "❌ <code>and</code> zwraca True tylko gdy oba warunki są prawdziwe."
        })
    );

    // 9. suma w pętli
    games.push(
        createTextInputGame({
            id: "g9_sum_range",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Suma liczb 0, 1, 2</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">suma</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">0</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-number">3</span>):</span>' +
                '<span class="mch-code-line">    <span class="mch-line-var">suma</span> <span class="mch-line-keyword">+=</span> <span class="mch-line-var">i</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">suma</span>)</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["3"],
            correctMessage: "✅ 0 + 1 + 2 = 3.",
            wrongMessage:
                "❌ Przejdź pętlę krok po kroku i policz 0 + 1 + 2."
        })
    );

    // 10. if / elif / else
    games.push(
        createTextInputGame({
            id: "g10_if_elif",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Instrukcja warunkowa</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">5</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">if</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">&gt;</span> <span class="mch-line-number">5</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"więcej"</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">elif</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">==</span> <span class="mch-line-number">5</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"równe"</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">else</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"mniej"</span>)</span>',
            questionHtml: "Co wypisze program?",
            placeholder: "wpisz tekst bez cudzysłowów",
            correctAnswers: ["równe", "rowne"],
            caseInsensitive: true,
            correctMessage:
                "✅ x jest równy 5, więc zadziała blok <code>elif</code>.",
            wrongMessage:
                "❌ Sprawdź po kolei warunki: >5, ==5, else."
        })
    );

    // 11. MCQ – błąd w def
    games.push(
        createMcqGame({
            id: "g11_find_bug_def",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Ten kod ma błąd składni.</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">def</span> <span class="mch-line-func">powitanie</span>(<span class="mch-line-var">imie</span>)</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"Cześć"</span>, <span class="mch-line-var">imie</span>)</span>',
            questionHtml: "Co trzeba poprawić, aby kod działał?",
            options: [
                {
                    value: "A",
                    label: 'A) Dodać drugi argument do funkcji <code>print</code>.'
                },
                {
                    value: "B",
                    label:
                        'B) Dodać dwukropek <code>:</code> na końcu linii z <code>def</code>.'
                },
                {
                    value: "C",
                    label: 'C) Zmienić <code>def</code> na <code>func</code>.'
                }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Po nagłówku funkcji musi być dwukropek.",
            wrongMessage:
                "❌ Pomyśl, jak zawsze wygląda linia <code>def nazwa(...):</code>."
        })
    );

    // 12. poprawna definicja funkcji
    games.push(
        createMcqGame({
            id: "g12_def_syntax",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Wybierz poprawną definicję funkcji.</span>',
            questionHtml: "Który zapis jest poprawny w Pythonie?",
            options: [
                { value: "A", label: '<code>function powitanie(imie):</code>' },
                { value: "B", label: '<code>def powitanie(imie):</code>' },
                { value: "C", label: '<code>def powitanie = (imie)</code>' }
            ],
            correctValue: "B",
            correctMessage:
                "✅ W Pythonie używamy słowa kluczowego <code>def</code> i dwukropka.",
            wrongMessage:
                "❌ Zwróć uwagę na <code>def</code> i dwukropek na końcu."
        })
    );

    // 13. operator modulo
    games.push(
        createMcqGame({
            id: "g13_modulo_symbol",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Który operator zwraca resztę z dzielenia?</span>',
            questionHtml: "W Pythonie resztę z dzielenia zapisujemy jako:",
            options: [
                { value: "A", label: "<code>//</code>" },
                { value: "B", label: "<code>%</code>" },
                { value: "C", label: "<code>/</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Operator <code>%</code> to modulo – reszta z dzielenia.",
            wrongMessage:
                "❌ <code>/</code> to dzielenie, <code>//</code> to dzielenie całkowite."
        })
    );

    // 14. indeksowanie list
    games.push(
        createMcqGame({
            id: "g14_list_index",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Indeksowanie list</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">10</span>, <span class="mch-line-number">20</span>, <span class="mch-line-number">30</span>]</span>',
            questionHtml:
                "Który element to pierwszy element listy <code>dane</code>?",
            options: [
                { value: "A", label: "<code>dane[1]</code>" },
                { value: "B", label: "<code>dane[0]</code>" },
                { value: "C", label: "<code>dane[2]</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Indeksowanie w Pythonie zaczyna się od 0, więc pierwszy element to <code>dane[0]</code>.",
            wrongMessage:
                "❌ W Pythonie liczymy elementy list od 0."
        })
    );

    // 15. typ z input()
    games.push(
        createMcqGame({
            id: "g15_input_type",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Funkcja input()</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">=</span> <span class="mch-line-func">input</span>(<span class="mch-line-str">"Podaj liczbę: "</span>)</span>',
            questionHtml: "Jaki typ ma zmienna <code>x</code> po tym kodzie?",
            options: [
                { value: "A", label: "liczba całkowita (int)" },
                { value: "B", label: "napis (str)" },
                { value: "C", label: "lista (list)" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ <code>input()</code> zwraca napis. Liczbę uzyskasz przez <code>int(x)</code>.",
            wrongMessage:
                "❌ Samo <code>input()</code> nie zamienia od razu na liczbę."
        })
    );

    // 16. komentarz
    games.push(
        createMcqGame({
            id: "g16_comment_symbol",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Komentarze w Pythonie</span>',
            questionHtml: "Jak zaczyna się komentarz jednolinijkowy w Pythonie?",
            options: [
                { value: "A", label: "<code>// komentarz</code>" },
                { value: "B", label: "<code># komentarz</code>" },
                { value: "C", label: "<code>-- komentarz</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ W Pythonie komentarz zaczyna się od <code>#</code>.",
            wrongMessage:
                "❌ <code>//</code> to komentarz np. w C#, w Pythonie używamy <code>#</code>."
        })
    );

    // 17. len listy MCQ
    games.push(
        createMcqGame({
            id: "g17_len_list_mcq",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">4</span>, <span class="mch-line-number">5</span>, <span class="mch-line-number">6</span>, <span class="mch-line-number">7</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">len</span>(<span class="mch-line-var">dane</span>))</span>',
            questionHtml: "Jaką wartość wypisze <code>len(dane)</code>?",
            options: [
                { value: "A", label: "3" },
                { value: "B", label: "4" },
                { value: "C", label: "7" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Lista ma 4 elementy, więc długość to 4.",
            wrongMessage:
                "❌ <code>len</code> liczy elementy listy, nie wartość ostatniego."
        })
    );

    // 18. break
    games.push(
        createMcqGame({
            id: "g18_break_keyword",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Jak przerwać pętlę wcześniej?</span>',
            questionHtml: "Jakim słowem kluczowym przerwiesz pętlę <code>for</code>?",
            options: [
                { value: "A", label: "<code>stop</code>" },
                { value: "B", label: "<code>exit</code>" },
                { value: "C", label: "<code>break</code>" }
            ],
            correctValue: "C",
            correctMessage:
                "✅ <code>break</code> natychmiast kończy działanie pętli.",
            wrongMessage:
                "❌ Poszukaj słowa kluczowego używanego właśnie w pętlach."
        })
    );

    // 19. poprawne if
    games.push(
        createMcqGame({
            id: "g19_if_syntax_mcq",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Wybierz poprawną instrukcję warunkową.</span>',
            questionHtml: "Który zapis jest poprawny w Pythonie?",
            options: [
                { value: "A", label: '<code>if x &gt; 3</code>' },
                { value: "B", label: '<code>if x &gt; 3:</code>' },
                { value: "C", label: '<code>if (x &gt; 3) then</code>' }
            ],
            correctValue: "B",
            correctMessage:
                "✅ W Pythonie po warunku stawiamy dwukropek.",
            wrongMessage:
                "❌ Zwróć uwagę na dwukropek i brak słowa <code>then</code>."
        })
    );

    // 20. for range(1,4)
    games.push(
        createMcqGame({
            id: "g20_for_range_order",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-number">1</span>, <span class="mch-line-number">4</span>):</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>',
            questionHtml: "Jaką sekwencję liczb wypisze ten kod?",
            options: [
                { value: "A", label: "<code>1 2 3</code>" },
                { value: "B", label: "<code>1 2 3 4</code>" },
                { value: "C", label: "<code>0 1 2 3</code>" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ <code>range(1, 4)</code> generuje 1, 2, 3.",
            wrongMessage:
                "❌ W <code>range(start, stop)</code> wartość <code>stop</code> nie jest wypisywana."
        })
    );

    // 21. Lista: indeks ujemny (-1)
    games.push(
        createTextInputGame({
            id: "g21_list_negative_index",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Ostatni element listy przez indeks -1</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-str">"A"</span>, <span class="mch-line-str">"B"</span>, <span class="mch-line-str">"C"</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">dane</span>[<span class="mch-line-number">-1</span>])</span>',
            questionHtml: "Jaki napis wypisze program?",
            placeholder: "wpisz literę...",
            correctAnswers: ["C", "c"],
            caseInsensitive: true,
            correctMessage:
                "✅ Indeks -1 oznacza ostatni element listy, czyli \"C\".",
            wrongMessage:
                "❌ W Pythonie indeks -1 to ostatni element listy."
        })
    );

    // 22. Lista: slicing [1:4]
    games.push(
        createTextInputGame({
            id: "g22_list_slice",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Fragment listy (slicing)</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">liczby</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">0</span>, <span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>, <span class="mch-line-number">3</span>, <span class="mch-line-number">4</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">liczby</span>[<span class="mch-line-number">1</span>:<span class="mch-line-number">4</span>])</span>',
            questionHtml:
                "Jaki fragment listy zostanie wypisany? (zapisz jako [1, 2, 3])",
            placeholder: "np. [1, 2, 3]",
            correctAnswers: ["[1,2,3]", "[1, 2, 3]"],
            trimWhitespace: true,
            correctMessage:
                "✅ <code>liczby[1:4]</code> to elementy o indeksach 1, 2, 3 → [1, 2, 3].",
            wrongMessage:
                "❌ W <code>lista[a:b]</code> b nie jest już wzięte pod uwagę (bierzemy a, a+1, ..., b-1)."
        })
    );

    // 23. Lista: in / not in
    games.push(
        createTextInputGame({
            id: "g23_in_operator",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Sprawdzanie, czy element jest na liście</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">kolory</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-str">"red"</span>, <span class="mch-line-str">"green"</span>, <span class="mch-line-str">"blue"</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-str">"yellow"</span> <span class="mch-line-keyword">in</span> <span class="mch-line-var">kolory</span>)</span>',
            questionHtml: "Co wypisze program? (True czy False?)",
            placeholder: "True / False",
            correctAnswers: ["False", "false"],
            caseInsensitive: true,
            correctMessage:
                "✅ \"yellow\" nie ma na liście, więc wynik to False.",
            wrongMessage:
                "❌ Operator <code>in</code> sprawdza, czy element znajduje się na liście."
        })
    );

    // 24. Pętla for po liście (łącznie)
    games.push(
        createTextInputGame({
            id: "g24_for_list_sum",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Suma elementów listy</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">liczby</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">2</span>, <span class="mch-line-number">4</span>, <span class="mch-line-number">6</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">suma</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">0</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">in</span> <span class="mch-line-var">liczby</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-var">suma</span> <span class="mch-line-keyword">+=</span> <span class="mch-line-var">x</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">suma</span>)</span>',
            questionHtml: "Jaką wartość wypisze program?",
            placeholder: "wpisz liczbę...",
            correctAnswers: ["12"],
            correctMessage:
                "✅ 2 + 4 + 6 = 12.",
            wrongMessage:
                "❌ Przejdź po kolei: suma = 0 → 2 → 6 → 12."
        })
    );

    // 25. while z licznikiem
    games.push(
        createTextInputGame({
            id: "g25_while_counter",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Pętla while z licznikiem</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">i</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">0</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">while</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">&lt;</span> <span class="mch-line-number">3</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>' +
                '<span class="mch-code-line">    <span class="mch-line-var">i</span> <span class="mch-line-keyword">+=</span> <span class="mch-line-number">1</span></span>',
            questionHtml:
                "Jaką sekwencję liczb wypisze program? (zapisz np. 0 1 2)",
            placeholder: "np. 0 1 2",
            correctAnswers: ["0 1 2", "0 1 2 ", "0,1,2", "0 1 2"],
            trimWhitespace: true,
            correctMessage:
                "✅ Pętla wypisze 0, 1, 2, a potem się zatrzyma, bo i stanie się równe 3.",
            wrongMessage:
                "❌ Przeanalizuj krok po kroku: start i=0, warunek i&lt;3."
        })
    );

    // 26. if z resztą z dzielenia (parzystość)
    games.push(
        createTextInputGame({
            id: "g26_if_even",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Sprawdzanie, czy liczba jest parzysta</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">10</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">if</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">%</span> <span class="mch-line-number">2</span> <span class="mch-line-keyword">==</span> <span class="mch-line-number">0</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"parzysta"</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">else</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"nieparzysta"</span>)</span>',
            questionHtml: "Jaki napis wypisze program?",
            placeholder: "parzysta / nieparzysta",
            correctAnswers: ["parzysta"],
            caseInsensitive: true,
            correctMessage:
                "✅ 10 jest podzielne przez 2, więc liczba jest parzysta.",
            wrongMessage:
                "❌ Użyj reszty z dzielenia: liczba parzysta ma resztę 0 przy dzieleniu przez 2."
        })
    );

    // 27. Zagnieżdżony if
    games.push(
        createTextInputGame({
            id: "g27_nested_if",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Zagnieżdżone warunki</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">x</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">7</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">if</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">&gt;</span> <span class="mch-line-number">0</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"plus"</span>)</span>' +
                '<span class="mch-code-line">    <span class="mch-line-keyword">if</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">&gt;</span> <span class="mch-line-number">5</span>:</span>' +
                '<span class="mch-code-line">        <span class="mch-line-func">print</span>(<span class="mch-line-str">"duży"</span>)</span>',
            questionHtml:
                "Jakie napisy wypisze program, linijka po linijce? (np. plus / duży)",
            placeholder: "np. plus / duży",
            correctAnswers: ["plus/duży", "plus / duży", "plus duży"],
            caseInsensitive: true,
            trimWhitespace: true,
            correctMessage:
                "✅ Najpierw wypisze \"plus\", a potem \"duży\".",
            wrongMessage:
                "❌ x &gt; 0, więc wejdziemy do pierwszego ifa, a potem sprawdzamy, czy x &gt; 5."
        })
    );

    // 28. MCQ: wybór poprawnego warunku
    games.push(
        createMcqGame({
            id: "g28_if_condition_mcq",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Który warunek sprawdza, czy x jest między 1 a 10 (włącznie)?</span>',
            questionHtml: "Wybierz poprawny zapis:",
            options: [
                {
                    value: "A",
                    label: '<code>if x &gt; 1 and x &lt; 10:</code>'
                },
                {
                    value: "B",
                    label: '<code>if 1 &lt;= x &lt;= 10:</code>'
                },
                {
                    value: "C",
                    label: '<code>if x &gt;= 1 or x &lt;= 10:</code>'
                }
            ],
            correctValue: "B",
            correctMessage:
                "✅ W Pythonie można pisać <code>1 &lt;= x &lt;= 10</code> – to czytelny zapis przedziału.",
            wrongMessage:
                "❌ Przyjrzyj się dokładnie znakom nierówności i słowu <code>or</code> / <code>and</code>."
        })
    );

    // 29. MCQ: pętla po zakresie
    games.push(
        createMcqGame({
            id: "g29_for_range_mcq",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-number">5</span>):</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>',
            questionHtml: "Jakie liczby zostaną wypisane?",
            options: [
                { value: "A", label: "<code>0 1 2 3 4</code>" },
                { value: "B", label: "<code>1 2 3 4 5</code>" },
                { value: "C", label: "<code>0 1 2 3 4 5</code>" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ <code>range(5)</code> daje liczby 0, 1, 2, 3, 4.",
            wrongMessage:
                "❌ Pamiętaj: <code>range(n)</code> generuje liczby od 0 do n-1."
        })
    );

    // 30. MCQ: continue w pętli
    games.push(
        createMcqGame({
            id: "g30_continue_mcq",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Pomiń wypisanie liczby 3</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">for</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-number">5</span>):</span>' +
                '<span class="mch-code-line">    <span class="mch-line-keyword">if</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">==</span> <span class="mch-line-number">3</span>:</span>' +
                '<span class="mch-code-line">        <span class="mch-line-keyword">continue</span></span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>',
            questionHtml: "Jaką sekwencję liczb wypisze program?",
            options: [
                { value: "A", label: "<code>0 1 2 3 4</code>" },
                { value: "B", label: "<code>0 1 2 4</code>" },
                { value: "C", label: "<code>1 2 3 4</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ <code>continue</code> przeskakuje wypisanie 3, więc mamy 0, 1, 2, 4.",
            wrongMessage:
                "❌ <code>continue</code> nie kończy pętli, tylko pomija resztę instrukcji w tej iteracji."
        })
    );

    // 31. MCQ: długość listy po remove
    games.push(
        createMcqGame({
            id: "g31_list_remove",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>, <span class="mch-line-number">3</span>, <span class="mch-line-number">2</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span>.<span class="mch-line-func">remove</span>(<span class="mch-line-number">2</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">len</span>(<span class="mch-line-var">dane</span>))</span>',
            questionHtml: "Jaką wartość wypisze program?",
            options: [
                { value: "A", label: "3" },
                { value: "B", label: "4" },
                { value: "C", label: "2" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ <code>remove</code> usuwa pierwsze wystąpienie wartości 2, więc zostają 3 elementy.",
            wrongMessage:
                "❌ Funkcja <code>remove</code> nie usuwa wszystkich dwójek, tylko pierwszą."
        })
    );

    // 32. MCQ: pusta lista a bool
    games.push(
        createMcqGame({
            id: "g32_empty_list_bool",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># Pusta lista w warunku</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> []</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">if</span> <span class="mch-line-var">dane</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"niepusta"</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">else</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-func">print</span>(<span class="mch-line-str">"pusta"</span>)</span>',
            questionHtml: "Co wypisze program?",
            options: [
                { value: "A", label: '<code>"niepusta"</code>' },
                { value: "B", label: '<code>"pusta"</code>' },
                { value: "C", label: "nic nie wypisze" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Pusta lista jest traktowana jak False, więc wykona się blok <code>else</code>.",
            wrongMessage:
                "❌ W Pythonie pusta lista, pusty napis czy 0 są traktowane jak False."
        })
    );

    // 33. MCQ: indeks spoza zakresu
    games.push(
        createMcqGame({
            id: "g33_index_error",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">10</span>, <span class="mch-line-number">20</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">dane</span>[<span class="mch-line-number">2</span>])</span>',
            questionHtml: "Co stanie się po uruchomieniu programu?",
            options: [
                { value: "A", label: "wypisze 0" },
                { value: "B", label: "wypisze 20" },
                { value: "C", label: "wystąpi błąd IndexError" }
            ],
            correctValue: "C",
            correctMessage:
                "✅ Lista ma indeksy 0 i 1, więc <code>dane[2]</code> spowoduje IndexError.",
            wrongMessage:
                "❌ Spróbuj policzyć elementy listy – ostatni indeks to długość-1."
        })
    );

    // 34. MCQ: while True + break
    games.push(
        createMcqGame({
            id: "g34_while_true_break",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">i</span> <span class="mch-line-keyword">=</span> <span class="mch-line-number">0</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-keyword">while</span> <span class="mch-line-keyword">True</span>:</span>' +
                '<span class="mch-code-line">    <span class="mch-line-var">i</span> <span class="mch-line-keyword">+=</span> <span class="mch-line-number">1</span></span>' +
                '<span class="mch-code-line">    <span class="mch-line-keyword">if</span> <span class="mch-line-var">i</span> <span class="mch-line-keyword">==</span> <span class="mch-line-number">3</span>:</span>' +
                '<span class="mch-code-line">        <span class="mch-line-keyword">break</span></span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">i</span>)</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            options: [
                { value: "A", label: "2" },
                { value: "B", label: "3" },
                { value: "C", label: "4" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Pętla zwiększa i: 1, 2, 3 – przy 3 wychodzimy z pętli i wypisujemy 3.",
            wrongMessage:
                "❌ Prześledź zmiany zmiennej <code>i</code> w każdej iteracji."
        })
    );

    // 35. MCQ: sum(listy) – prosty przypadek
    games.push(
        createMcqGame({
            id: "g35_sum_builtin",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">liczby</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>, <span class="mch-line-number">3</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">sum</span>(<span class="mch-line-var">liczby</span>))</span>',
            questionHtml: "Jaką wartość wypisze program?",
            options: [
                { value: "A", label: "5" },
                { value: "B", label: "6" },
                { value: "C", label: "1 2 3" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ Funkcja <code>sum</code> dodaje elementy listy: 1 + 2 + 3 = 6.",
            wrongMessage:
                "❌ <code>sum</code> nie wypisuje listy, tylko sumę jej elementów."
        })
    );

    // 36. MCQ: list comprehension – kwadraty
    games.push(
        createMcqGame({
            id: "g36_list_comp",
            codeHtml:
                '<span class="mch-code-line mch-line-comment"># List comprehension</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">kwadraty</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-var">x</span> <span class="mch-line-keyword">**</span> <span class="mch-line-number">2</span> <span class="mch-line-keyword">for</span> <span class="mch-line-var">x</span> <span class="mch-line-keyword">in</span> <span class="mch-line-func">range</span>(<span class="mch-line-number">3</span>)]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">kwadraty</span>)</span>',
            questionHtml: "Jaka lista zostanie wypisana?",
            options: [
                { value: "A", label: "<code>[0, 1, 4]</code>" },
                { value: "B", label: "<code>[1, 4, 9]</code>" },
                { value: "C", label: "<code>[0, 1, 2]</code>" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ <code>range(3)</code> daje 0, 1, 2, a ich kwadraty to 0, 1, 4.",
            wrongMessage:
                "❌ Podstaw po kolei x=0,1,2 do wyrażenia x**2."
        })
    );

    // 37. MCQ: max z listy
    games.push(
        createMcqGame({
            id: "g37_max_list",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">5</span>, <span class="mch-line-number">2</span>, <span class="mch-line-number">9</span>, <span class="mch-line-number">1</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">max</span>(<span class="mch-line-var">dane</span>))</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            options: [
                { value: "A", label: "9" },
                { value: "B", label: "5" },
                { value: "C", label: "1" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ Funkcja <code>max</code> zwraca największy element listy, czyli 9.",
            wrongMessage:
                "❌ Zastanów się, który element listy jest największy."
        })
    );

    // 38. MCQ: min z listy
    games.push(
        createMcqGame({
            id: "g38_min_list",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">dane</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">5</span>, <span class="mch-line-number">2</span>, <span class="mch-line-number">9</span>, <span class="mch-line-number">1</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-func">min</span>(<span class="mch-line-var">dane</span>))</span>',
            questionHtml: "Jaką liczbę wypisze program?",
            options: [
                { value: "A", label: "1" },
                { value: "B", label: "2" },
                { value: "C", label: "5" }
            ],
            correctValue: "A",
            correctMessage:
                "✅ Funkcja <code>min</code> zwraca najmniejszy element listy, czyli 1.",
            wrongMessage:
                "❌ Popatrz, która liczba jest najmniejsza."
        })
    );

    // 39. MCQ: rozszerzenie listy extend
    games.push(
        createMcqGame({
            id: "g39_list_extend",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">a</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">b</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">3</span>, <span class="mch-line-number">4</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">a</span>.<span class="mch-line-func">extend</span>(<span class="mch-line-var">b</span>)</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">a</span>)</span>',
            questionHtml: "Jaka lista zostanie wypisana?",
            options: [
                { value: "A", label: "<code>[1, 2, [3, 4]]</code>" },
                { value: "B", label: "<code>[1, 2, 3, 4]</code>" },
                { value: "C", label: "<code>[[1, 2], [3, 4]]</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ <code>extend</code> dodaje elementy listy b do listy a: [1, 2, 3, 4].",
            wrongMessage:
                "❌ <code>append</code> dodaje całą listę jako jeden element, a <code>extend</code> rozkłada ją na elementy."
        })
    );

    // 40. MCQ: append listy
    games.push(
        createMcqGame({
            id: "g40_list_append_vs_extend",
            codeHtml:
                '<span class="mch-code-line"><span class="mch-line-var">a</span> <span class="mch-line-keyword">=</span> [<span class="mch-line-number">1</span>, <span class="mch-line-number">2</span>]</span>' +
                '<span class="mch-code-line"><span class="mch-line-var">a</span>.<span class="mch-line-func">append</span>([<span class="mch-line-number">3</span>, <span class="mch-line-number">4</span>])</span>' +
                '<span class="mch-code-line"><span class="mch-line-func">print</span>(<span class="mch-line-var">a</span>)</span>',
            questionHtml: "Jaka lista zostanie wypisana?",
            options: [
                { value: "A", label: "<code>[1, 2, 3, 4]</code>" },
                { value: "B", label: "<code>[1, 2, [3, 4]]</code>" },
                { value: "C", label: "<code>[[1, 2], [3, 4]]</code>" }
            ],
            correctValue: "B",
            correctMessage:
                "✅ <code>append</code> dodaje całą listę jako jeden element: [1, 2, [3, 4]].",
            wrongMessage:
                "❌ Tu używamy <code>append</code>, nie <code>extend</code> – więc dodajemy JEDEN element, który sam jest listą."
        })
    );
    // ----- INIT -----

    function init() {
        gameRoot = $("mch-game-root");
        xpDisplay = $("mch-xp-display");
        xpStatusEl = $("mch-xp-status");
        solvedInSeries = 0;
        refreshGoldenStatus();
        if (!gameRoot) return;

        loadXP();
        resetXP();
        updateXPDisplay();

        buildNewOrder();
        orderPos = 0;
        loadGameFromOrder();
    }

    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        init();
    } else if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", init);
    } else if (window.attachEvent) {
        window.attachEvent("onload", init);
    } else {
        window.onload = init;
    }
})();
