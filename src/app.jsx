import React, { useState } from "react";

// Пункты сбора
const pickupPoints = [
  {
    name: "Мария",
    coords: [55.661496, 37.415622],
    address: "Боровское шоссе, д.2к7",
  },
  {
    name: "Елена",
    coords: [55.739407, 37.777419],
    address: "ул. Кусковская, д.17",
  },
  {
    name: "Дарья",
    coords: [55.587779, 37.603415],
    address: "Варшавское шоссе, д.141к13",
  },
  {
    name: "Надежда",
    coords: [55.859615, 37.440658],
    address: "ул. Фомичёвой, д.14к3",
  },
  {
    name: "Елена",
    coords: [55.657306, 37.609991],
    address: "Болотниковская улица, 10А",
  },
  {
    name: "Галина (контактное лицо - Елизавета)",
    coords: [55.805827, 37.794064],
    address: "ул. Константина Федина, д 8",
  },
  {
    name: "Анастасия",
    coords: [55.806762, 37.575109],
    address: "2-я Хуторская улица, д. 18к2",
  },
  {
    name: "Янош",
    coords: [55.675245, 37.527920],
    address: "Ленинский проспект, д.93",
  },
  {
    name: "Зоомагазин «Хитрый нос»",
    coords: [55.854517, 37.683060],
    address: "Ярославское шоссе 12к2",
  },
  {
    name: "Ветеринарная клиника «Dr.Vetson»",
    coords: [55.641122, 37.595501],
    address: "Балаклавский проспект, д. 9",
  },
  {
    name: "Ветеринарная клиника «Dr.Hug» (Малая Филёвская)",
    coords: [55.738302, 37.472917],
    address: "ул. Малая Филёвская, д.12к1",
  },
  {
    name: "Ветеринарная клиника «Dr.Hug» (Хорошёвское шоссе)",
    coords: [55.781003, 37.537550],
    address: "Хорошёвское шоссе, д. 38Дс3",
  },
  {
    name: "Ветеринарная клиника «Синица»",
    coords: [55.724403, 37.410654],
    address: "ул. Маршала Неделина, д.16с5",
  },
  {
    name: "Ветеринарная клиника \"Пара капибар\"",
    coords: [55.794032, 37.495078],
    address: "ул.Народного ополчения, д.48к1",
  },
  {
    name: "Ветеринарная клиника \"Лама рядом\"",
    coords: [55.718076, 37.433597],
    address: "ул.Гродненская, д.10",
  },
];

const metroStations = {
  "Октябрьское поле": [55.7934, 37.4936],
  "Сокол": [55.8058, 37.5146],
  "Таганская": [55.7416, 37.6528],
};

function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NearestPickupPoint = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);

  const handleSearch = () => {
    const stationCoords = metroStations[station];
    if (!stationCoords) {
      alert("Станция не найдена. Попробуйте другую.");
      return;
    }

    const distances = pickupPoints.map((point) => ({
      ...point,
      distance: haversineDistance(stationCoords, point.coords).toFixed(2),
    }));

    const nearest = distances.reduce((a, b) =>
      parseFloat(a.distance) < parseFloat(b.distance) ? a : b
    );

    const routeTimes = {
      publicTransport: "35 мин",
      car: "20 мин",
      walking: "1 ч 10 мин",
    };

    setResult({ nearest, stationCoords, routeTimes });
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
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Найти ближайший пункт
      </button>

      {result && (
        <div className="mt-4">
          <p className="mb-2">
            📍 Ближайший пункт: <strong>{result.nearest.name}</strong>
          </p>
          <p>Адрес: {result.nearest.address}</p>
          <p>Расстояние: {result.nearest.distance} км</p>
          <p>🚌 Общественный транспорт: {result.routeTimes.publicTransport}</p>
          <p>🚗 Машина: {result.routeTimes.car}</p>
          <p>🚶 Пешком: {result.routeTimes.walking}</p>

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-bold">📧 Письмо клиенту:</p>
            <pre className="text-sm whitespace-pre-wrap">
              {`Вы можете передать помощь в пункте "${result.nearest.name}" по адресу: ${result.nearest.address}.
Расстояние от метро "${station}": ${result.nearest.distance} км.
Примерное время в пути:
- Общественный транспорт: ${result.routeTimes.publicTransport}
- Машина: ${result.routeTimes.car}
- Пешком: ${result.routeTimes.walking}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearestPickupPoint;