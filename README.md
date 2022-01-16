Program symuluje grę w statki pomiędzy dwoma graczami którymi steruje komputer.
Zaimplementowana jest bardzo podstawowa sztuczna inteligencja - gdy strzał gracza trafi, lecz nie zatopi statku, to następny strzał oddany będzie w pole graniczące z poprzednim strzałem (o ile to możliwe).
Program został napisany w React.

Po uruchomieniu programu widać na ekranie plansze obu graczy oraz podstawowe informacje o grze.
Pod planszami znajdują się 4 przyciski do sterowania grą:
Initialize Ships - rozmieszcza losowo statki na planszach graczy
Next Shot - symuluje strzał kolejnego gracza
Toggle Auto Play - włącza automatyczną rozgrywkę (ruchy graczy domyślnie wykonywane są co pół sekundy)
Reset Game - resetuje grę do stanu początkowego

Program składa się z trzech głównych komponentów:
game - komponent który zawiera cały interfejs, oraz steruje grą
board - plansza jednego gracza
square - pojedyńcze pole na planszy

"square" to prosty komponent funkcyjny, który renderuje pojedyńcze pole na planszy, w props pobiera dwie wartości:
shipType - nazwę statku, który znajduje się na danym polu, aby wyświetlić pole w kolorze tego statku
value - wartość boolean która zawiera informację o tym czy dane pole zostało już ostrzelane. Jeśli tak, to renderuje na nim znak "X"

"board" renderuje planszę gracza. W metodzie "render" wywoływana jest metoda "renderBoard", która w pętli wywołuje metodę "renderRow", aby wyrenderować kolejne rzędy planszy.
Komponent ten dostaje od komponentu "game" w props informacje o planszy potrzebne do wyrenderowania jej.

Komponent "game" steruje całą grą. Renderuje on dwie plansze, wymienione wcześniej przyciski, informacje o nazwach i kolorach statków w grze, informację o poprzednim ruchu, o tym kto wygrał grę, o ilości pozostałych statków dla gracza, nazwę gry, oraz nazwy graczy.
Posiada on następujący state:
ships - informacje o nazwach i rozmiarach statków
boardA, boardB - informacje o planszach graczy. Są to tablice zawierające po 100 elementów (po jednym dla każdego pola na planszy), które zawierają informacje o tym czy na danym polu znajduje się statek, nazwę tego statku, oraz czy pole zostało trafione.
nextIsA - flaga zawierająca informację o tym który gracz będzie wykonywał kolejny ruch
shipsPlaced - flaga zawierająca informację o tym czy statki zostały rozstawione na planszy
autoPlay - flaga zawierająca informację o tym czy jest włączona automatyczna rozgrywka
interval - wartość wyrażona w milisekundach określająca odstęp czasowy między ruchami graczy podczas automatycznej rozgrywki
intervalId - wartość pomocnicza, używana do zatrzymywania automatycznej rozgrywki
lastMove - string zawierający wiadomość o ostatnim ruchu
shipsRemainingA, shipsRemainingB - informacja o tym ile nie zatopionych statków zostało danemu graczowi
gameOver - informacja o tym czy któryś z graczy wygrał rozgrywkę
winningMessage - string zawierający wiadomość o wygranej danego gracza
lastShotWasHitButNotSinkA, lastShotWasHitButNotSinkB - informacja o poprzednim ruchu danego gracza zawierająca informację o tym czy poprzedni strzał trafił w statek, lecz go nie zatopił i jeśli tak, to w drugim indeksie zawierający informację o tym, w które pole był oddany ten strzał (Używane do podstawowej sztucznej inteligencji - po trafieniu lecz nie zatopieniu następny strzał będzie celował w pola graniczące z nim)

Metody:
render() - renderuje komponent
resetGame() - resetuje grę i state do początkowego
shoot() - wykonuje następny strzał. Najpierw sprawdza czy statki są rozłożone, potem czy gra nie powinna się już skończyć i jeśli tak, to wywołuje metodę "onGameFinished()", następnie losuje pole do strzału wywołując metodę "chooseFieldToShoot(board, lastWasHitButNotSink)", potem zapisuje oddany strzał, ewentualnie obniża ilość statków które zostały w grze, oraz zapisuje informację o ostatnim strzale w stringu. Na końcu aktualizuje state.
chooseFieldToShoot(board, lastWasHitButNotSink) - losuje pole do strzału. Pobiera informacje o planszy i o tym czy ostatni strzał to było trafienie lecz nie zatopienie. Jeśli było, to losuje jedno z pól graniczących z poprzednim strzałem, a jeśli w żadne z nich nie można strzelić, lub ostatni strzał był pudłem, bądź zatopeniem, to wybiera losowe pole.
onGameFinished() - ustawia informację o tym który gracz wygrał, oraz wyłącza automatyczną rozgrywkę, jeśli była włączona
toggleAutoPlay() - włącza lub wyłącza automatyczną rozgrywkę
initializeGame() - inicjalizuje grę, czyli ustawia statki na planszy za pomocą metody "placeShips()" i aktualizuje state
placeShips(board) - ustawia statki dla danej planszy. Dla każdego statku losowo wybiera czy zostatnie on postawiony w pionie czy poziomie, a następnie za pomocą metody "placeShip" wybiera miejsce w którym zostanie on postawiony.
placeShip(board, horizontally, length, name) - rozstawia statek na planszy. Pobiera informacje o planszy, o tym czy statek ma być postawiony w pionie czy poziomie, jak długi ma być statek oraz jego nazwę. Wybiera losowo miejsce początkowe i potem wybiera kolejne miejsca poziomo lub pionowo. Gdy dane pole z pomocą metody "checkIfValidSpotForPlacement" okaże się nieprawidłowe, to losuje nowe miejsce początkowe i rozstawia statek, a następnie zwraca zaktualizowaną tablicę
checkIfValidSpotForPlacement(board, spot, firstCell, horizontally) - sprawdza czy dane pole jest prawidłowym polem do postawienia części statku. Sprawdza czy pole nie wychodzi poza indeks planszy lub czy nie znajduje się już na nim inny statek, oraz w przypadku ustawiania aktualnego statku poziomo, sprawdza czy statek nie przeszedłby do kolejnego rzędu.