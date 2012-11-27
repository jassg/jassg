<html>
	<head>
		<title>{{ title }} - {{ node.url }}</title>
	</head>
	<body>
		{% block content %}
			{{ content|raw }}
		{% endblock %}
	</body>
</html>
