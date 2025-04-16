import React, { useState } from "react";

const pickupPoints = [
  { name: "Мария", address: "Боровское шоссе, д.2к7", coords: [55.661496, 37.415622], isVolunteer: true, phone: "+79639764558", nearestMetro: "Говорово" },
  { name: "Елена", address: "ул. Кусковская, д.17", coords: [55.739407, 37.777419], isVolunteer: true, phone: "+79032322433", nearestMetro: "Перово" },
  { name: "Дарья", address: "Варшавское шоссе, д.141к13", coords: [55.587779, 37.603415], isVolunteer: true, phone: "+79104742988", nearestMetro: "Аннино" },
  { name: "Елена", address: "Болотниковская улица, 10А", coords: [55.657306, 37.609991], isVolunteer: true, phone: "+79169798613", nearestMetro: "Нахимовский проспект" },
  { name: "Галина", address: "ул. Константина Федина, д 8", coords: [55.805827, 37.794064], isVolunteer: true, phone: "+79169810644", nearestMetro: "Щёлковская" },
  { name: "Анастасия", address: "2-я Хуторская улица, д. 18к2", coords: [55.806762, 37.575109], isVolunteer: true, phone: "+79262113585", nearestMetro: "Дмитровская" },
  { name: "Янош", address: "Ленинский проспект, д.93", coords: [55.675245, 37.527920], isVolunteer: true, phone: "+79031637020", nearestMetro: "Новаторская" },
  { name: "Зоомагазин «Хитрый нос»", address: "Ярославское шоссе 12к2", coords: [55.854517, 37.683060], workingHours: "10:00-22:00", nearestMetro: "Ростокино" },
  { name: "Dr.Vetson", address: "Балаклавский проспект, д. 9", coords: [55.641122, 37.595501], workingHours: "круглосуточно", nearestMetro: "Чертановская" },
  { name: "Dr.Hug", address: "ул. Малая Филёвская, д.12к1", coords: [55.738302, 37.472917], workingHours: "круглосуточно", nearestMetro: "Пионерская" },
  { name: "Dr.Hug", address: "Хорошёвское шоссе, д. 38Дс3", coords: [55.781003, 37.537550], workingHours: "круглосуточно", nearestMetro: "ЦСКА" },
  { name: "Синица", address: "ул. Маршала Неделина, д.16с5", coords: [55.724403, 37.410654], workingHours: "9:00-21:00", nearestMetro: "Молодежная" },
  { name: "Пара капибар", address: "ул.Народного ополчения, д.48к1", coords: [55.794032, 37.495078], workingHours: "круглосуточно", nearestMetro: "Октябрьское поле" },
  { name: "Лама рядом", address: "ул.Гродненская, д.10", coords: [55.718076, 37.433597], workingHours: "круглосуточно", nearestMetro: "Давыдково" },
];

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fetchCoords = async (stationName) => {
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e"; // 🔑 Вставьте сюда свой API-ключ
  const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=метро ${encodeURIComponent(
    stationName
  )}, Москва`;
  const res = await fetch(url);
  const data = await res.json();
  const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
  const [lon, lat] = pos.split(" ").map(Number);
  return [lat, lon];
};

const NearestPickupPoint = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    try {
      const stationCoords = await fetchCoords(station);

      const distances = pickupPoints.map((point) => ({
        ...point,
        distance: haversineDistance(stationCoords, point.coords),
      }));

      const sorted = distances.sort((a, b) => a.distance - b.distance);

      let nearestPoints;
      if (sorted[0].distance <= 1.5) {
        nearestPoints = [sorted[0]];
      } else {
        nearestPoints = sorted.slice(0, 2);
      }

      const formatted = nearestPoints.map((point) => ({
        ...point,
        distance: point.distance.toFixed(2),
      }));

      setResult({ nearestPoints: formatted, stationCoords });
    } catch (e) {
      alert("Ошибка при геокодировании станции.");
    }
    setLoading(false);
  };

  const generateLetter = () => {
    if (!result) return "";

    let volunteerMessage = "";
    let volunteerCount = 0;
    let volunteerContacts = [];

    const letterBody = result.nearestPoints
      .map((point, index) => {
        if (point.isVolunteer) {
          volunteerCount += 1;
          volunteerContacts.push(point); // Собираем волонтёров
          return `- у нашего волонтёра в районе м. ${point.nearestMetro}, контакт волонтёра, с которым можно обсудить передачу помощи: ${point.phone}, ${point.name}.`;
        } else {
          return `- в ветеринарной клинике "${point.name}" по адресу ${point.address}, режим работы: ${point.workingHours}.`;
        }
      })
      .join("\n");

    if (volunteerCount === 1) {
      volunteerMessage = `Не затруднит ли вас связаться с волонтёром самостоятельно, чтобы согласовать все детали напрямую? При обращении можете сказать, что контакт вам дали в фонде 'РЭЙ'.`;
    } else if (volunteerCount > 1) {
      volunteerMessage = `Не затруднит ли вас связаться с выбранным волонтёром самостоятельно, чтобы согласовать все детали напрямую? При обращении можете сказать, что контакт вам дали в фонде 'РЭЙ'.`;
    }

    // Генерация письма
    return `${username}, добрый день!

Благодарим вас за неравнодушие к бездомным животным и обращение в наш фонд!

Перечисленные вами вещи с радостью примут в приютах! 

Мы будем вам очень признательны, если вы сможете передать их в один из пунктов сбора помощи, расположенных в следующих местах:

${letterBody}

${volunteerMessage}

Если передать помощь не получится по какой-либо причине, пожалуйста, напишите нам снова.

Спасибо!`;
};

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайшего пункта сбора</h2>

      <input
        type="text"
        placeholder="Введите станцию метро (например, Октябрьское поле)"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Введите ваше имя"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Найти пункт
      </button>

      {loading ? (
        <div className="mt-4 p-2 text-gray-500">Загрузка...</div>
      ) : result ? (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">Ближайшие пункты:</p>
          <ul>
            {result.nearestPoints.map((point, index) => (
              <li key={index}>
                {point.name} — {point.distance} км
              </li>
            ))}
          </ul>

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-bold">✉️ Сгенерированное письмо:</p>
            <pre className="bg-white p-4 border rounded text-sm">{generateLetter()}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NearestPickupPoint;
