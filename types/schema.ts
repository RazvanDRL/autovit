export type _Book = {
    title: string;
    authors: string[];
    publication_year: number;
    ratings_count: number;
    average_rating: number;
};

export type Equipment = {
    [category: string]: {
        label: string;
        value: string;
        category: string;
    }[];
};

export type Ad = {
    id: string,
    user_id: string,
    brand: string,
    model: string,
    price: number,
    engine_size: number,
    power: number,
    km: number,
    fuel_type: string,
    body_type: string,
    year: number,
    location_city: string,
    location_county: string,
    description: string,
    short_description: string,
    created_at: string,
    photos: string[],
    user_full_name: string,
    user_phone: string,
    is_company: boolean,
    brand_id: number,
    model_id: number,
    group?: string,
    group_id?: number,
    equipment?: Equipment;
}

export type BodyType = "Sedan" | "Hatchback" | "SUV" | "Coupe" | "Cabriolet" | "Pickup"; 
export type FuelType = "Diesel" | "Benzină" | "Electric" | "Hibrid";

export const body_types = ["Sedan", "Hatchback", "SUV", "Coupe", "Cabriolet", "Pickup"] as const;
export const fuel_types = ["Diesel", "Benzină", "Electric", "Hibrid"] as const;

export const equipment_types = [
    // Safety
    { value: "abs", label: "ABS", category: "Siguranță" },
    { value: "esp", label: "ESP", category: "Siguranță" },
    { value: "airbag_driver", label: "Airbag șofer", category: "Siguranță" },
    { value: "airbag_passenger", label: "Airbag pasager", category: "Siguranță" },
    { value: "airbag_side", label: "Airbag-uri laterale", category: "Siguranță" },
    { value: "alarm", label: "Alarmă", category: "Siguranță" },
    { value: "immobilizer", label: "Imobilizator electronic", category: "Siguranță" },

    // Comfort
    { value: "ac", label: "Aer condiționat", category: "Confort" },
    { value: "climate_control", label: "Climate control", category: "Confort" },
    { value: "electric_windows", label: "Geamuri electrice", category: "Confort" },
    { value: "electric_mirrors", label: "Oglinzi electrice", category: "Confort" },
    { value: "heated_seats", label: "Scaune încălzite", category: "Confort" },
    { value: "cruise_control", label: "Cruise control", category: "Confort" },
    { value: "parking_sensors", label: "Senzori parcare", category: "Confort" },

    // Multimedia
    { value: "cd_player", label: "CD Player", category: "Multimedia" },
    { value: "navigation", label: "Sistem navigație", category: "Multimedia" },
    { value: "bluetooth", label: "Bluetooth", category: "Multimedia" },
    { value: "usb", label: "USB", category: "Multimedia" },

    // Other
    { value: "alloy_wheels", label: "Jante aliaj", category: "Altele" },
    { value: "xenon", label: "Faruri Xenon", category: "Altele" },
    { value: "led_lights", label: "Lumini LED", category: "Altele" },
    { value: "panoramic_roof", label: "Trapă panoramică", category: "Altele" },

    // Audio and Connectivity
    { value: "apple_carplay", label: "Apple Carplay", category: "Audio și conectivitate" },
    { value: "android_auto", label: "Android Auto", category: "Audio și conectivitate" },
    { value: "bluetooth", label: "Bluetooth", category: "Audio și conectivitate" },
    { value: "radio", label: "Radio", category: "Audio și conectivitate" },
    { value: "hands_free", label: "Sistem hands-free", category: "Audio și conectivitate" },
    { value: "usb_port", label: "Port USB", category: "Audio și conectivitate" },
    { value: "wireless_charging", label: "Wireless charging", category: "Audio și conectivitate" },
    { value: "audio_system", label: "Sistem audio", category: "Audio și conectivitate" },
    { value: "touchscreen", label: "Monitor cu touch screen", category: "Audio și conectivitate" },
    { value: "navigation", label: "Sistem navigație", category: "Audio și conectivitate" },
    { value: "head_up_display", label: "Head up display", category: "Audio și conectivitate" },
    { value: "voice_control", label: "Control vocal", category: "Audio și conectivitate" },
    { value: "internet", label: "Conexiune Internet", category: "Audio și conectivitate" },

    // Electric Vehicle Features
    { value: "energy_recovery", label: "Sistem recuperare energie", category: "Mașini electrice" },
    { value: "fast_charging", label: "Funcție încărcare rapidă", category: "Mașini electrice" },
    { value: "charging_cable", label: "Cablu încărcare mașină electrică", category: "Mașini electrice" },

    // Electronics and Driver Assistance
    { value: "cruise_control_type", label: "Tip pilot automat", category: "Electronice și asistență șofer" },
    { value: "cruise_control", label: "Pilot automat", category: "Electronice și asistență șofer" },
    { value: "headlights_type", label: "Tip faruri", category: "Electronice și asistență șofer" },
    { value: "laser_headlights", label: "Faruri laser", category: "Electronice și asistență șofer" },
    { value: "front_parking_sensors", label: "Senzori parcare fata", category: "Electronice și asistență șofer" },
    { value: "rear_parking_sensors", label: "Senzori parcare spate", category: "Electronice și asistență șofer" },
    { value: "parking_assist", label: "Asistenta la parcare", category: "Electronice și asistență șofer" },
    { value: "auto_parking_system", label: "Sistem de parcare automat", category: "Electronice și asistență șofer" },
    { value: "camera_360", label: "Camera video 360º", category: "Electronice și asistență șofer" },
    { value: "rear_camera", label: "Camera video spate", category: "Electronice și asistență șofer" },
    { value: "electric_mirrors", label: "Oglinzi exterioare cu reglare electrica", category: "Electronice și asistență șofer" },
    { value: "heated_mirrors", label: "Oglinzi exterioare incalzite", category: "Electronice și asistență șofer" },
    { value: "foldable_mirrors", label: "Oglinzi exterioare rabatabile electric", category: "Electronice și asistență șofer" },
    { value: "digital_mirrors", label: "Oglinzi exterioare digitale", category: "Electronice și asistență șofer" },
    { value: "blind_spot", label: "Avertizare unghi mort", category: "Electronice și asistență șofer" },
    { value: "lane_change_assist", label: "Asistenta schimbare banda", category: "Electronice și asistență șofer" },
    { value: "lane_assist", label: "Lane assist", category: "Electronice și asistență șofer" },
    { value: "distance_control", label: "Controlul distantei", category: "Electronice și asistență șofer" },
    { value: "speed_limiter", label: "Limitator viteza", category: "Electronice și asistență șofer" },
    { value: "brake_assist", label: "Asistenta la franare", category: "Electronice și asistență șofer" },
    { value: "turn_assist", label: "Sistem asistenta viraj", category: "Electronice și asistență șofer" },
    { value: "traction_control", label: "Controlul tractiunii", category: "Electronice și asistență șofer" },
    { value: "hill_descent", label: "Asistenta in panta", category: "Electronice și asistență șofer" },
    { value: "hill_assist", label: "Asistenta in rampa", category: "Electronice și asistență șofer" },
    { value: "speed_sign_recognition", label: "Sistem recunoastere indicatoare de viteza", category: "Electronice și asistență șofer" },
    { value: "traffic_sign_recognition", label: "Sistem recunoastere semne trafic", category: "Electronice și asistență șofer" },
    { value: "intersection_assist", label: "Sistem asistenta intersectie", category: "Electronice și asistență șofer" },
    { value: "autonomous_driving", label: "Conducere autonoma", category: "Electronice și asistență șofer" },
    { value: "high_beam_assist", label: "Asistenta faza lunga", category: "Electronice și asistență șofer" },
    { value: "directional_headlights", label: "Faruri directionale", category: "Electronice și asistență șofer" },
    { value: "adaptive_headlights", label: "Faruri autoadaptive", category: "Electronice și asistență șofer" },
    { value: "dynamic_headlights", label: "Faruri directionale dinamice", category: "Electronice și asistență șofer" },
    { value: "auto_headlights", label: "Faruri cu temporizator", category: "Electronice și asistență șofer" },
    { value: "headlight_washers", label: "Spalare faruri", category: "Electronice și asistență șofer" },
    { value: "daytime_lights", label: "Lumini de zi", category: "Electronice și asistență șofer" },
    { value: "led_daytime_lights", label: "Lumini de zi LED", category: "Electronice și asistență șofer" },
    { value: "fog_lights", label: "Faruri ceata", category: "Electronice și asistență șofer" },
    { value: "led_fog_lights", label: "Faruri ceata LED", category: "Electronice și asistență șofer" },
    { value: "led_taillights", label: "Stopuri LED", category: "Electronice și asistență șofer" },
    { value: "follow_me_home", label: "Follow me home", category: "Electronice și asistență șofer" },
    { value: "led_interior_lights", label: "Iluminare interioara LED", category: "Electronice și asistență șofer" },
    { value: "start_stop", label: "Sistem Start/Stop", category: "Electronice și asistență șofer" },
    { value: "tire_pressure_sensors", label: "Senzori presiune roti", category: "Electronice și asistență șofer" },
    { value: "electric_parking", label: "Frana parcare electrica", category: "Electronice și asistență șofer" },
    { value: "power_steering", label: "Servodirectie", category: "Electronice și asistență șofer" },
    { value: "differential_lock", label: "Diferential blocabil", category: "Electronice și asistență șofer" },
    { value: "differential_lock_selector", label: "Selector diferential blocabil", category: "Electronice și asistență șofer" },
    { value: "traffic_jam_assist", label: "Asistenta ambuteiaj", category: "Electronice și asistență șofer" },
] as const;

export type EquipmentType = typeof equipment_types[number]["value"];
