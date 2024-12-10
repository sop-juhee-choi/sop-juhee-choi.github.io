<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:a="http://www.w3.org/2005/Atom">
    <xsl:output method="html" encoding="UTF-8"/>
    <xsl:template match="text()"/>
    <xsl:template match="a:feed">
        <html>
            <head>
                <title>
                    <xsl:value-of select="a:title"/>
                </title>
            </head>
            <body>
                <ul class="outlined-text no-bullets">
                    <xsl:apply-templates/>
                    <br/>
                </ul>
            </body>
        </html>
    </xsl:template> 
    <xsl:template match="a:entry">
        <li class="outlined-text-semibig">
            <xsl:choose>
                <xsl:when test="a:title/@link">
                    <a href="{a:title/@link}" target="_blank">
                        <xsl:value-of select="a:title"/>
                    </a>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="a:title"/>
                </xsl:otherwise>
            </xsl:choose>
        </li>
        <xsl:for-each select="a:perf_s/a:perf">
            <ul class="no-bullets">
                <li>
                    <xsl:choose>
                        <xsl:when test="a:title/@link">
                            <a href="{a:title/@link}" target="_blank">
                                <xsl:value-of select="a:title"/>
                            </a>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="a:title"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </li>
                <xsl:for-each select="a:loc_s/a:loc">
                    <ul class="no-bullets">
                        <li>
                            <xsl:choose>
                                <xsl:when test="./@link">
                                    <a href="{./@link}" target="_blank">
                                        <xsl:value-of select="."/>
                                    </a>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="."/>
                                </xsl:otherwise>
                            </xsl:choose>
                       </li>
                    </ul>
                </xsl:for-each>
            </ul>
        </xsl:for-each>
    </xsl:template> 
</xsl:stylesheet>