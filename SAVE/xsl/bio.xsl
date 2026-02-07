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
                </ul>
            </body>
        </html>
    </xsl:template> 
    <xsl:template match="a:entry">
        <li class="outlined-text">
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
    </xsl:template> 
</xsl:stylesheet>