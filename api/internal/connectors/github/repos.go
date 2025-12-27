package github

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
)

func ListOrgRepos(ctx context.Context, accessToken string, org string) (map[string]any, error) {
	target := fmt.Sprintf("https://api.github.com/orgs/%s/repos?per_page=100", url.PathEscape(org))
	decoded, _, err := doJSON(ctx, accessToken, http.MethodGet, target, nil)
	if err != nil {
		return nil, err
	}
	return coerceMap(decoded), nil
}

