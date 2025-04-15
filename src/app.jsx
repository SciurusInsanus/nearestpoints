import React, { useState } from "react";

const pickupPoints = [
  { name: "Мария", address: "Боровское шоссе, д.2к7", coords: [55.661496, 37.415622], isVolunteer: true, phone: "+79639764558", nearestMetro: "Говорово" },
  { name: "Елена", address: "ул. Кусковская, д.17", coords: [55.739407, 37.777419], isVolunteer: true, phone: "+79032322433", nearestMetro: "Перово" },
  { name: "Дарья", address: "Варшавское шоссе, д.141к13", coords: [55.587779, 37.603415], isVolunteer: true, phone: "+79104742988", nearestMetro: "Аннино" },
  { name: "Надежда", address: "ул. Фомичёвой, д.14к3", coords: [55.859615, 37.440658], isVolunteer: true, phone: "+79164075941", nearestMetro: "Планерная" },
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
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e"; // 🔑 ВСТАВЬ СЮДА СВОЙ API-КЛЮЧ
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

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайшего пункта сбора</h2>

      <input
        type="text"
        placeholder="Введите станцию метро (например, Октябрьское поле)"
        value={station}
        onChange={(e) => setStation(e.target.value)}
        className="border p-2 w-full mb-2 rounded"
      />

      <button
        onClick={handleSearch}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Поиск..." : "Найти ближайший пункт"}
      </button>

      {result && (
        <div className="mt-4">
          {result.nearestPoints.map((point, index) => (
            <div key={index} className="mb-4 p-2 border rounded">
              <p className="mb-1">📍 <strong>{point.name}</strong> ({point.nearestMetro})</p>
              <p>Адрес: {point.address}</p>
              <p>Расстояние: {point.distance} км</p>
              {point.phone && <p>📞 Телефон: {point.phone}</p>}
              {point.workingHours && <p>🕒 Время работы: {point.workingHours}</p>}
              {point.isVolunteer && <p>🙋 Волонтёр</p>}
            </div>
          ))}

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-bold">📧 Письмо клиенту:</p>
            <pre className="text-sm whitespace-pre-wrap">
{result.nearestPoints.map((point) =>
`Вы можете передать помощь в пункте "${point.name}" по адресу: ${point.address}.
Ближайшая станция метро: ${point.nearestMetro}.
Расстояние от станции "${station}": ${point.distance} км.\n`
).join("\n")}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearestPickupPoint;
