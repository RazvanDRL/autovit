async function main() {
    const params = {
        vin: "WDD2221731A445725",
        lang: "en",
        version: "V2",
        token: "03AFcWeA7bMHadsm7Qsvacm5DvaWN0DuMRtthYeKUylJIe7ClYm1LlWO5-wk2cy_SCnVXEvAG3Fk2y1j3Lav_r0rxGCYeDPGRyec8bQFMzGOyPvv-ka6P7HraVRPridcKe3DHjAhwL7kPzBb_XAEvAHTgZNKYHXmZvPlNqved3LLYuiq04n9UujEMho-1I85FosvjDjIpQPphHR7zd4ZWPVfVFip83-6nZe-WPfk9zbeshI-C3VCFC5OFLM6E6wDhG8IVyt_b8ppruepaM292Bd0ij4O50ypVQL3Av6u5jybvA72c2H0wU-f6K38SWfrYAohDODhagrSD_QTYBfSwlsaKMdPxlrJ1yHZRmQMIvRyZyPpsxuJLskzfwKmBl3qX8okQvUe89bHqvEYeYchA4lQdCzRNmJ1hiJvQ7RaKmU8c0v55Cw5TNQJGsCIUtHo6EBohJNAutAIqd4pSa1GvwYcjnZ7RWBYDY24d8ChBpP37FSOo5A9JEgMC_kbEFVWrojQJqFYAq6x952KfHFSDR4xLOxNqzQlkqq5XN6XvyRzxt2USsfHc616Jgr370TH3nAZw9HP_SRCDDbsgcHyh-DqrTaZEPxipwQsHELAZlGiBziWvqWMzS-slAw-cOmVv8kPIkUPXJnGwWix_Ar-SeqHkJKI3OZhwOa4XU2MdG1HKOzsx-rB4mQnXNcptacxpu7igEo747RakJZTlHKoN0qQsjlsuZK-jTiMZOPiw7LggXTXI_Z9vfvMliF5xvepGdOgWF_7p8hik0-nR7aRqT6LYZb6E0pGfDh0ogEhTJ2mfLX0Afs0tqgUIat8TuA9k1i5MPTEeVSD_9iMFEB5TcUgK0mxVVyHvJtkc6g8d0LXsh9hfkNxRINEN-6tj2A6Hv-frV04jNrTE3V2xCuZy88L3rcI0hmnudJMdtqTT7sacU9nmiTpZcyb4lowAFo-QYgR2iwE02973enWQAMqAbMs4duBEA1mis4i4MHFQYHNFc6ZI7hopuveccLzEN0CYiMC5FdeNP9gN35EsggK7fQL1QoxZQvxRXvzUhTh_zRIwd8sG7AgG1911inPnEljsQ3WwKceDC2Ua186nLJxrdEhTvsZEOD1tK1QwnKi4ke9_joA67u2hWvi92dJWWucySO_-NiR5ROw7IXs9ijUHBmhfCxCdn-cUVuOmjdwuqYkVrNarLSP1GK0H1WBph9ZROVflnyBImoFVNB-uKxTjI9N8XNNqOsutGf7m885rWa_au2GkhH-pJrmZW_5KNw-LjHpZ-jnhvPoXU4wbMu5hxjrak7kSU_fzhRDKJvQHj7kRW9spyPJj0_FIyPXg3gn5r4-CJ7jzGOBTx_ufgucjKldR_Xtt0tZXijMWWfLnAbW2GkE2Zr6ngeSsEHyCbZvHjRZJDoAM1CwRkukzXpbcB1p6LU69_jR-JsRm9n2vAXHwoVW7vUGXDukHTrivMhOf6raSXCn47pRn_HTd46kb0u286PqZAnrLjyN7gRCffjxAl7t2973GDGtUqc8_f4LadJrH0Ep82Y0Xoo7Om5cEDr4UWlrIxheFDZb0ol_4V11pm6lAuJ0YrlsXZU5nVRqknx2gwGrze2cJhNI6kzQIkujfX6R31_6mYS0ZE1PmdpjjTwi0vQ4DetbdSR0JeoTGzrWYLqcpxSIujplyeO2w7DSoQGUKTswK4pOFX1gDZhYLnKGdtcqNf67G_qM_-0suhQQe0PVmRXjKZ2Ois7Q5HPtTB6oM_Z-X1ox9r34lP90l3PklkVQ9nzjyPD6wXa_FdZqxGguk7vFKaIrQsIUfZJCAS1d_GFLNsoEh0smKtWBjbiLWpUA8KI6elumy6ySTohNnyImq9MS4rcGDHFdj4br9bg6AN2P2lsz8FiHcyz7C9zFCqQetSYpCzIVtB7yUhm01ipzYtUTrxUGxmyFZuv9ebqF0RH9nxlQ4AzqiMOk8B7uFR8eBMSqHJa45uPJtMvHhRyvnnmoQTaTsjRweYze8Az8ugsFqIPMj4AUcSyvLdHvSPMX9ZqrM"
    };

    // Create a FormData object
    const formData = new URLSearchParams(params);

    try {
        const response = await fetch("https://en.vindecoder.pl/api/startUp", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"127\", \"Not)A;Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "Referer": "https://en.vindecoder.pl/en/",
                "Referrer-Policy": "same-origin"
            },
            "body": "{\"vin\":\"WDD2221731A445725\",\"lang\":\"en\",\"version\":\"V2\",\"token\":\"03AFcWeA4TZmF7MSSrw0YNIHkdtH2YSDXyknW55n90CvbkKrJiQ5_eTyETygswmuSySJHdXuF28gfVa9q1XK657rSM-sL-clNocpyw59IhPPX-djo1_W9Y6_eic8cbMpEvKY-40HkQFuPmNqx-VE-03lhnqcb42f3Q4KDU2q8lSAWvBEk0lXYZoSgbbydDS34emSfEoWdg20uwohRArlw7wRRUl9NLdz_d3g7SBxazhMIKS3DAjbBSSpVIHTdvAiA_Y522COdUzIUU58wc1O3RBXYlKwW9Mne7JwnNvp9kvPmzRefwur6Pcqe81i5ExzbhCQwkVN75tTZcFxPo97ZvI6x6fxXGGe0KeidRFaBiHJigvFawaSIxMy4erLw3gBYrq0u2IERY0Fz25ezFNm4JZ6XVlT4mEtoDZBeQiVU84fz3etDrow6j0xq9pkW-ASI95cPR7dC0J3kiqMYggthJWmOsuoRdssiDjsDGRAKuKXOUwlcVNja2Ld7WrdGVZu46uIRFBQKVIKVWPPdINQY0yEPBZCp_h7i328l6BWRbk878BYEKaGCsa8tnR-2oMlhd9aYMRJKycsdu_0TcCB4zHUJpSRspX1ELeE8MoQ3sE5RpkWYHCNCONY31a5yKuFvdi-xYRnlXqrf3lEWcYauApLIsICHo3jmTayvw7Y7wkQzXrCwg6FFPxCmGCFTFA1EqNWHMkVU3DpXc-rJxqRb_NxJqeUYnvGuDU-vpzK-sc2oTUZiByaVZjnbJXIxe5L-FURw87ucmsAZlYjc548FdfC85Mvc54Mu0iOAyyOo8LjtnbDiA8Xk0eiWXvvFLUVtsaVr5Mcsoit1jVeaGc6ZyqwDDwBUwWErDZMV6_gzwZbrrw_I1qJlRpXOVNnTXmO5PmktQAH4d7idlTs5NIWrzOxk7j33mlw_2js8glYlBDWIRTBl8d0Ez-_Ok1imEgRFvm1FGvEegVWDx-7CZ-FlWq0Cesc5tmw_oWKWt5eROFdcEf1qpF4svtPJym52Ndo0yxmYHgdTxQwqpoCmXjqV5uwRPmtJQixVRbioDf8rMXsCDMkudATUcxpwgDgETFLBCCB31L5_c8gu3wUf2tKpqbKanPAKxX5SYwwky4KbWfAE5yTyaX-Vl8oZ6wsVzs7o6C57_n9sriroDj3iEKOYBUKwr_RqDQajwuE7uEaqyUmIpSkp82wZKtN58q237MRds3ehi3L2GucAPvKEWLT4894thxOFWDW5SiAVGCuIFoPYPIFot1dzMFmIpJ3gepeyN_hBgG0aFpy5F6Tya4UdI6YoDCW4jiUSEN-3xEm0x6KY8pf_4Fs_ipLcnIGs6kwAII7AqNq-ZOhE-ZbBySgM0yaHZX3dfHpWN4PJoNeEGRDnIZrG8a7f5Bjn0qHP-NjYKGDq43W52UgihcqxR7jhAW9SUvFw4wZp6BCM6uA-TAvo4qWErHnv3m14lhM-Nrtb5e7k75BG9NGHjDMl3DW5KtNHGO6_mhcG58sEXiOOdUZbCVizkauLTCIXg4lRZdeabUFDlqkgurhjwJrDBku3sfQl2j8qscMXJXy6m2ZYU2j4yLeiUOmdjW6EFF4iaBKV8cR7jiRQnk2JYzsItVgMkd7-KIZILm4cEaERcmK_qLR75RXK5N8Kdrx90LJc4SpE9Lb4jUZ-mmvI9ZmeBR1wzK8weF3aBq0dCeB9rtDUY18IHg2VixYD5KrC1KxB7MrFh4hROs7w9c4mRsaWfNzHyNfpsWxheRayd8K2A1q801Y_tVmP18PCIe76_AXKBrJUtE910NnvbLTW83shrO2h3bejX9seknG3brf9_xEMhmc9aNdzlByjJV7zWbN9cM29VyK0y78IRcVLLgCwni9HSw2MzRnOZibuMcT2BTHsQ_EOuFmeF0WFFyNxTiuQFpDj9pVPSn0rOBKzb2rSk9L7Xstu2dejB1pegGTUOKCMQBuT4k63xugDvfmtde6Glor-uw75OQ4MDXf-w639APy79uWOnb0x-6wsUPg\"}",
            "method": "POST"
        });

        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Log the data to the console
        console.log(data.result.decoder.vehicle);
    } catch (error) {
        // Log any errors that occurred during the fetch or response processing
        console.error("Error fetching data:", error);
    }
}


main();
