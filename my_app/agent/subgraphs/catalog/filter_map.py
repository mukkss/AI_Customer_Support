FILTER_JOIN_MAP = {
    "category": {
        "join": """
            JOIN catalog.product_categories pc
              ON pc.product_id = p.product_id
            JOIN catalog.categories c
              ON pc.category_id = c.category_id
        """,
        "column": "c.category_name"
    },
    "subcategory": {
        "join": """
            JOIN catalog.product_subcategories psc
              ON psc.product_id = p.product_id
            JOIN catalog.subcategories sc
              ON psc.subcategory_id = sc.subcategory_id
        """,
        "column": "sc.subcategory_name"
    },
    "topic": {
        "join": """
            JOIN catalog.product_topics pt
              ON pt.product_id = p.product_id
            JOIN catalog.topics t
              ON pt.topic_id = t.topic_id
        """,
        "column": "t.topic_name"
    },
    "subject": {
        "join": """
            JOIN catalog.product_subjects psu
              ON psu.product_id = p.product_id
            JOIN catalog.subjects su
              ON psu.subject_id = su.subject_id
        """,
        "column": "su.subject_name"
    },
    "country": {
        "join": """
            JOIN catalog.product_countries pcou
              ON pcou.product_id = p.product_id
            JOIN catalog.countries co
              ON pcou.country_code = co.country_code
        """,
        "column": "co.country_code"
    },
    "unit": {
        "join": """
            JOIN catalog.product_units pu
              ON pu.product_id = p.product_id
            JOIN catalog.units u
              ON pu.unit_id = u.unit_id
        """,
        "column": "u.unit_name"
    },
    "event": {
        "join": """
            JOIN catalog.product_events pe
              ON pe.product_id = p.product_id
            JOIN catalog.events e
              ON pe.event_id = e.event_id
        """,
        "column": "e.event_name"
    }
}

DIRECT_FILTERS = {
    "scale_denominator": "p.scale_denominator",
    "product_type": "p.product_type",
}

RANGE_FILTERS = {
    "year_from": "p.year_reference_release >= %s",
    "year_to": "p.year_reference_release <= %s",
}
